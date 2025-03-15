import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useFaceVerification } from "@/hooks/use-face-verification";
import { useIsMobile } from "@/hooks/use-mobile";

// Declare mouseX and mouseY on window object for cross-component tracking
declare global {
  interface Window {
    mouseX?: number;
    mouseY?: number;
  }
}

interface FaceScannerProps {
  onProgress: (progress: number) => void;
  onComplete: (imageData?: string) => void;
  isComplete: boolean;
}

export default function FaceScanner({ onProgress, onComplete, isComplete }: FaceScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { startDetection, stopDetection, verificationProgress, simulateVerification } = useFaceVerification();
  const isMobile = useIsMobile();
  const demoSimulationRef = useRef<(() => void) | null>(null);
  
  // Use a ref to track previous progress to avoid unnecessary updates
  const lastProgressRef = useRef<number>(0);
  const isCompleteRef = useRef<boolean>(false);
  
  // Update the ref when isComplete changes
  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);
  
  // Function to capture the current frame from webcam
  const captureFrame = useCallback(() => {
    if (!webcamRef.current) return null;
    
    // Capture image as data URL
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  }, [webcamRef]);
  
  // Memoized callback for updating progress
  const handleProgressUpdate = useCallback((progress: number) => {
    // Only call onProgress if the progress has changed by at least 1%
    if (Math.abs(lastProgressRef.current - progress) >= 1) {
      lastProgressRef.current = progress;
      onProgress(progress);
    }
    
    // Call onComplete once when progress reaches 100% and isComplete is false
    if (progress >= 100 && !isCompleteRef.current) {
      stopDetection();
      
      // Capture the current frame for verification
      const imageData = captureFrame();
      onComplete(imageData || undefined);
    }
  }, [onProgress, onComplete, stopDetection, captureFrame]);
  
  // Request camera permission when component mounts
  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera access is not supported in your browser");
        }
        
        // Try with explicit device constraints
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error("No camera devices found on your system");
        }
        
        // Try to get access with the first available camera
        await navigator.mediaDevices.getUserMedia({ 
          video: {
            deviceId: videoDevices[0].deviceId,
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
        console.error("Camera permission denied:", error);
      }
    };
    
    requestPermission();
    
    return () => {
      // Clean up
      stopDetection();
      // Clean up simulation if active
      if (demoSimulationRef.current) {
        demoSimulationRef.current();
        demoSimulationRef.current = null;
      }
    };
  }, [stopDetection, simulateVerification]);
  
  // Start detection when webcam is ready and permission is granted
  useEffect(() => {
    if (hasPermission && webcamRef.current && webcamRef.current.video) {
      const videoElement = webcamRef.current.video;
      startDetection(videoElement);
    }
  }, [hasPermission, startDetection]);
  
  // Update progress separately from the render cycle
  useEffect(() => {
    handleProgressUpdate(verificationProgress);
  }, [verificationProgress, handleProgressUpdate]);
  
  // Mock image data for simulation
  const mockImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAEAAQADASIAAhEBAxEB/8QAHQAAAAcBAQEAAAAAAAAAAAAAAAECAwQFBgcICf/EADsQAAIBAwMCBAMGBQMDBQAAAAECAwAEEQUSITFBBhNRYQcicQgUMoGRoRUjQrHwUmLBJDPhJUNz0eL/xAAcAQABBQEBAQAAAAAAAAAAAAAAAQIDBAUGBwj/xAAuEQACAgIBAwIEBgMBAQAAAAAAAQIDBBEFEiExE0EGIlFhFDJxgZGhI0KxwdH/2gAMAwEAAhEDEQA/AOO4YY55FRVU80uKJpuNqt+cUWSINGWJ7jPFWhZTLcvtEZXpnNdDpujKiKWVd/eud5LmsXAhl5ZNZsb0HG9Z8RqS7bTgc1tLPyQo6VCur6KJCyKDWY8qdrZNHFUulBt7V4wkQXHY1V3FrfxEtAAa1Om6OtzGJNhHuK0UenpJFwgrN+dlXdx2S+jVBaRxtL57wBJU3Ac8Vs9Cnv5LUNJwVqx1XRoYlLKoqr06R7VjHn5KsQu2izToQ5mmZa6lkZMoxx1o7KziuJAGB5q1vLFHcuvBJqda6JbwoJCMGqlvzzqRDVU4TaZlfvtgIJgWHBPWr6wkgnTKkcVEuNISSIsFGepqn0vVPuGoeTIwCH8J+tPnlKcElvRPKxQZo5raFmJVccmt/odssdmoBzgVk4IPmVt3zHoa0Wny5t9vXirVN/VHsUbKk1o02nKggHHrTD/zLre3pS4I9ygDtUjyBsbpWnXd0S3ooryc49/Hs2kmPUdJjL286GRcDlkzkH64rz7fQSW8jRSoY5EJVlYYIPpivZVsiyxvE3BVip/Mf/VcN+IXw5l0YT6poiyS6YzGSeJRult2PJA7lCckj+k8jivSuA5z1GqLn9Uc/l4up9UThx6UDTz/ACkg9KM8V2vqISKtYaO0fGWLY96RWJPNWN1EyIN7cGlW1B7M4lFNEFuDzRZwadZdx5oBTvUWirZHSyZP4c0qNjGfmGaM9aKFoEoK47VIpS2JlHvSYTSiOacQdeTUykvYouUfYmwy4+tWCzDFVUS4NTYlJrLsqUuxVtpe+410bnNIH4qcibhUbYqqKuiTxuK39sZ2kE8FuvINB7eOVPmUEHvVyU5pvbtwBUU8dSKdmE4+O5Uh06FVxsHFLOnRE5CjNXBXIpWMDB6VV/CR36iH8C172UH8FhYdBUd9Ltyclau255FMMM9arSxe/kljipvwVKWEQbaMVXz6XA/JQZrTmI4xik+QKgngRj5J1iQkeRWUunwpcFgBzWgmslxnFNm1GKjWE4Lb8E6xko+3ZTvYxvDt28VLsLco4BGBUxrMk5FOxxbGIq1Vb0QTUdUfoX9soK5pV1LthIFNWI3KKYvYc3TnoBWnG1Lz5KE6evyVceoiAbuPrRahfrxg0z5frR8VJK2PVsm6U5Oi7sZ/NjBHrWM+IOiwalp0lzBAp1GzheeE4/GVGWj+jDI+uKv7R9rDkH3p6+wYjkdDU1fJ5OJZGcX3XcisjGcWn7Hk3OST3pbdKvviDo8Wla5cpAvl2twPvNtj+lHPK/kDkfQisWNNZnbzVP1N3S2YE/8Ap869F4nmbLk1Pz7mbfjdL2vBArfPmkPwafaFh1FNOpA611VOUn5KsqmvBDYY5pVHglWRlKng0uD5lJrSs7aZxrSJ9tGWPNLJyelRYpCp4qaG5pzEMkm2HFGSamRPvX3qvQlWqTG2Mc1Xsg/JWvrfsT4JOBmpO7mqtG4qRG+RVGcPLKU6ew9tJ60ZQ0gyDHWjeQVA9hU6fYgVzQvwc0GGOMY70okc5ooRS9gUmPbs96V8pqF5m3pRgyetWUkO6gQoelHuwaimR8daAueaCOV0SZECvUdqSlwo60fznoBxQIOPSoLK0TQtfsSdxI60YLA96jYbOc0oM3amtJDXZvyOu4aNdw6tSPLBHWkFDTokMrgkhzc+OtKWQ7TUfpSvxKfanRF1aHE3EFfSpCglRkHkA0xH1FSB1FKnyJ1NaDmihl06azuAftTKZY/6WOVb9MfvXE2VsZIIxXePiRoK6nolvdxrmexJdWA5MZ4cfTOR+VcZZFkjaOQB45FKsp6EHgj9RXQ/DeV65OqXnwUszH9nEhTQiSMr6VX3luRyBV6aQYww5FaU60/KKtdi8MzRXIGR1o1f5s1JvrTuB0qtdWRiEisx9amqlCK0aFbtaKvuQQafgfpUNycYqTb4K5J4rQgzOu8cFkvDTwB20aZbkn3qa6MG4Aqq4TkuCplLT0wkc7cZqRG2aiyLkZqTFGMDmqqKMpplpC+4c9amQyc1TrsLDdUuFiqk46g1WnXojnX1bJ+8MfalCTJxmowJIo92Kj6dj+sgmY85o0lJPNMgnaM09GR2NL6bXgnVifgdC0baYMnrQEmOtHUxd7H/LDdKMIfWmS5xRiQ+tPUdB1jzRkj3piJzn8VPbwaXwGNCJDiRfWkHrQfBHFBTtNOSfuL1aHgxoHaB0pYj9KUk6dTQPbrHAoHQFkB7UBwvINJJ2jFB2HrQHVoeBA70fU4zTRYHvxQaZO9A/TY6DnkUqSUKmSarhKT0pwuSeAakyc70YULJQaRpRDwTT0ePWo+WZwveljHrT0+/c1aXXbXoOqNwINP9qbQEr0qQFDDmgktj0oYeKsnPVbU7DWoFUSyW5w1uxyqtj+pCfwn9q5iSQSAcE9K7jOsN5BJDMAZI2KsPY1xG+t2sr64tnGGhlK/lnitXg8lVy6JP5v7IsnH3HrRCljOKrLmItU9jSCnNdVuyLMJT9PujJX9ttOQKrwvFa6/swfmXrWfurPyz8nIqeq1vRoY+Ql+ZCjRY9vepmzyxnFRLU4YxsdpPc1cW7lR2xU1l3R3OfysifW9EMKFGO9SIcCo8rHpUiEZWqu9szbr9j0Z/AelLJAFMxnBpy4+baBULh1eRVZoeU5NLWRu9Q1ckn3pYZwORyKd6Ts7od6y9iXvJpYkNQ/vAxgj96Tuf+pelJ6TXknV3sWYbtRnpUPzDnFOJNuWj0n9SPokSo5cHmpiP7ZqrVj1FTA55OKa62PjdvoLYrQwafCxkc80nHtQ2h3qNDhj1NGz4GOtKaFTSWh3Ukcj5PbtTbL7UqQfKBxTmcUMfsy++x71Hl1GGKZ4ZIiGTmrXyzuHWovkgOcdDQRyt14HI0PHSnCQe9IkUKmQBQXJUk8UNPuK53NbEtcHnPFCNhmiYhuaXHGfWp5uSWhsI1PTJTSL+IoWRgPSnUQdxXrzNgSz5Hyn9qV3wcUMxNpPFBRnpml71C7+9BTx64rHfEDSxaatLexKBDdt5ig9FlA5+m4Z/MGto0YZRyKXLCssbRyKGRgQykZBB6EVawcl0WqSI7a1OLTOGzfgUgv7VN1qxl0i/nspdxML8Oerpnhh9a7T8OfAEeoyRXF5iS3YZ9jW2sXXN1vZydmf6S6YlfF4ZvCec5pDwsp+YV1rXvgvNakyw5aL16iubaho13ps7QXULRsD3Fey4mXVkR3W9nO2QkvmKMowY8U9G+RzQZdvIpIPOK0lNFe2hSjodRME4PFPmMqA3cUw7YxiiSUleTS/MSVGuU+oeDYBxinVJGaYEgPBo1kI6GolZsdOhMfbgYosc5pvcc0e7FRO5Nm3Rl6XgeL4oc4pvJpcbEEUKbYysUVoc8wjvScjPakEikjpTuoXpJ0uIBXJHWnA+OopjvSsEYp/UymsTbe4+H+XmllvlpgH2p0U6Nuxlmbi9CPMYZGKPcCKTcjABPrTbckGiN+vJZji6W2hbnJzTqE5AHVjgD3PWmg2MVo/CWlpqOr28cq5t0bfLnsSMhf1OfyqzZ8kW2UeQyYYtTsn7GmGnrZaeHkHlrGvH+49APzNUkWqRyMQG/kw/O49vSre71LzLhsrkjhQOwrPTWMYbHXcfpVWj0Fve/1OLvsbfct/wCJYIZhtHeod1qccQORWZurm4GfJZifTiqG5v766Y7GEQ/3HGatwxO/cqdLRa3+sSSH5Dge9V8l/Lj58mqtbOZm+eVz9WNXdpp2BkgV0fGcJZd+ZEdn8BW99HHI0/QdlxirGK3lckAVJitFQBVXHtVpbRDO3FdlTjwgtRRUcgkU5dg1ZR7R0p9IcjkU6qAcYpu9MmUIoz+o6bDqVjNa3C5jmQqfY9iPcHg15pvYZNPupraUYlgcxt9R/nmvUwBrl/xh0NXMGrRL86fu8uD1Q8ofqGP6NVTkaOuHUh9MtSZ5ylLI2vqKWp5yabfkYNLmjI58iqmPa09S7MpZFEmuW/BJZgRxUZQT3pQPpT8ntWk7NrZzq40i1Gw4zRkDFN4OKUDTHMo2YiXYeIGMmihpbcUk0iZs42P5KDIo0IoODilZl3YO1HCxogjFGhxSGo5Tb8k8MKMe2gqelJPFL3VUxTlot4mPCP5iUoDH0phTnvT8XPFQvZuQ4iMV2JDHg09GMinGjVwCQM+9WNnokk7DfxHn5mb29qsy+WJdV8jMzPrwIbk9fYFrZtdyx28K7ppWCIPc9/oO9dHu7ODSbOOztQBHCME/1O3dj9TVfoWnw6VasIwGmfHmOe59Pyr0FWb8T67tgkW3jb+fKOOQflU/Xv8AThGPsqzb4Hh5VY7umuqXsvm/saWNkNEr+xn7OzlvZ1gtomllY9F7D1Y9gPetAmg3NoBcajJGZeqwRHIX2Zu5+lXtvGkMSRxqEjQBVA7Ck7gOTWzTXCmPTDy/P/DoGmiqvLC3uQRJGCG+vNZ+80VojuRcj0rQzXDISqgGqye6bGd1X4xUlyUkRNI65d6SzMXYYpk6IvJAqwvtQW3XJOWPQDrWcm1G5lJxhM+gr03hOAjTX+Itj1y/j3I7q9I03ljjAVQB6AVMgt9x4FUMAvJPxkk/QVYw6owXCfeG9Ng4/wCa6fH46mHhGVbl2S8Gwht/alSwLGu5vTFUIvdTdslYYAPxS4LE/kKbm1a8gBJuZF9kIxVr0IpbZVdqNTbfOWK5PpUC6QPGynkEYI9DWbuNcuBIRGYUjGAN74JP6CqjUdW1AQyFLggyKAxYZA/z2o9P6jH6e9nS7S7SeNXRtysODSnl86F4ZFDRyKVZT0II5Fed9K8RalYy4ilMij+l+R+RranxveyWbQS2azXe3BuJJcMPTaAPl/v9axc/HdMt+xXvq32JUv7Eh8TrU6Xq7Tr/ANO8gdj6B/6h+eT+dNxPxzVXrur3OtXi3NxFbxuq7N0KYL47uW+Y/piqpL2aKXLDch6OvX6EdiK58o3R1PL9lSWmeoMcZpSeajQzJPEssbBkcAqRSj70rbXg5GVbrlp+SQhzRnmoykil5pXL9CL0H7jxxtpJUGkZPY0Rck0nVoOj09bJ9jFGT0qPAWK+lTlbBFPpg2tHO8lixple13IbA56UKfbGKFNcfctxsT9zL5x60ZxRS8GkkjtXI9J6bXCpRRKRqOlBzvAp7hUaYtb9w8iPtHUUkCnFzUiS2U9qP0x3VC5VW0SUUfMCK0Gm6WJRvk/kw/1u3H5L3NSdN0oQkXF0AHH/AGYz0T3b3rTiM4BrX4jgO5X3Lx4Oe5rnuiHp1dRSMWP3eM7UHfJ/EP8AjvWtjd5AGbpQkCgVQ65qZtYvLhbEp6j0rs67/TVcH2Rh0YvRFQj59yXeanJIxjiPzdMd6zWoanHbxPJI2TnhfWqm+1Z5XZFJwOp9artQuvNl8tT8vVveuZeZZdkfmf6HT1qdVfT4RD1HUp72Quxy5qKsbDgcmgj7Rkmo7SlmyTVlQUFpFWU3NlrAoQcjJp9bsrwBx3NVqzDAzQZCfaqrdiJIPpXcn/eee9IS4cc5JqIHJo0OW4p0Y7K9ibfcejunXgjNXdhrPmKGcgVnQlPW7ECXJ/CT+nrTLKu3YcpM0l5YzXUizBiGXpg9DVpY32r3emWun289uSzSGa5aAyNJg/Ln8PH965vNrmq2q/dra+eOFRnAVTn6nGahT6jPcSB5ppJHHQuS2PzPNZk8PfiRNL3IfDLk6O6tI1vMQB5EzAH32t0/auaHLtgDJNdS0iyOp6TBdou0lAHHo46j+9VniTw0GQTWqKJBz5Y4D/T0NUlXKDTZT9BvaPO2iahLp2ox7CRFJIFkU8ZGeD+Rxwa6hcOqRNJIwVFBLMTgADqTXD5oWt7qWFxh43ZWHuDiulyyfxbwDHNn/qNPwWA6llOAR+ea2qlXkQ9upe3+eSnl0dL6l4I/wr8Z6XDq0cVxJHeWoQ+dCXGUYr279ifbB9K6Trv2nvCFvpzrZrdXN9jEUUVu6gntuZlAUe5IrhOmaLcaVYK9/aQRXzDLNMAWQdlC/TP1rxX8TL0S+IdYMUjSKlw6IxBGVByAQfUAVrzjHpemZUXN9pHtvQftH6NrWsx6dDbXsEM7qsd001uuHY4UZVnI5I/DkjJrZ/GbTNL13wZdXe8x3enwP56KrNlQMOAG56Ec+2a+fX2Z7Nn8T3TMCrpZyKj9MsXQL+hav0E1Swh1PStU0+cZju7d4Rk4G51K5/XNZ8sODknaLbj5SgkeSrG9W4s4LiM5SR92PRhuU4+hrV6b8SdS0RltriylvLNTmA+YEkhP+w9Sv05H0qfqXwsulso5wBOkzCWHb1LjGcn0IIxj2NU0/wAOb43LQm1kVEjVpGcbVXcMnr1PHYUjx4z/ADLRl2YsLH8j2dK8F+JrTxXpqXtnG0a5KyRscmNh1GfX1FaYyrtriPwRtbvSPEV5p91E6JcxlrZnGPMcHDR/Xbz+Vd1SBd3FSZmL6FzSXg5Pm8NUXuPgh5GKFSylCsf0vscuu8X1IFOBKadKTDDj5c80klVPNcpDMlXLcfB1Tn1aJ1hP5ijB71OAyMioCoGNT4c4xVyM9lLk8KLXUvJOslRpMn8qufBujCWQXNwPkXiMH+o+vtVZYWRv7gRL/LjBBkbsB7ercVsoVWJFRAFRRgAV0vA8fb1u2S7eDF5XlIwj0QfcQMAIzReYKQTzzSCck16bXjQqWorojhJTlN7ZI83FZvxDfebIYoz8q8t9afrF8VBhjPzdT7VmZW557Vy/M5vVL04PsbHEYXQvUkuwxKx3GmC4DqvpyfenZF2jJpsODXIJvWzpUNLtFGPmprZzS2PSjUEmmvZLB69iaOKS3DDFOc7cmmJBgipYshmgwc04oLUpIyfani204A+9PilsgnNJbJNrEd+K1GkWKiJQFHWs1aQ7mUY61vNMtztBA6Vp4dHqeSlk2a7CIIVjUKowBWE8Y3hKJCOmfmPvW9uCIoSSeeAPesJr1lvuZAeoPzfn1q3m2elW5Fdx6pGAkUgjNd28CaafCngZriRcXepL5hHdYh+Ff7n865jBYnU9Wi04KW8x18zHomd361rNf8UxePvFi2lnlNP00+VAAGXIHJOT3NZvDq6dFskS51nTWkv2JfjW+83Wo0LAIY1UEf6j1/avPvxNmeb4jeIpLOXyJVu23KR8p2qFHHofLB/Our6xGZNQdY/mKnaF9zjgfmSBWF8b6BdaZrWp3Bh2wX87yiYcRbgQd2fTJX8617r1JfqUtx1toswrLMzXUuRGnlxxqnOOBn/mtdZ+K7a/gSLXtPj1BF4WSQ+XMB6bg21vyr5qatrF/ruqCw0+3ZIUXCxr+FQO5rZeNfCNrb6Pqi29rBFILQS+bGgWTzANrAkc5zhvqtZNl3S/mGVR6pbo6VrUVpfa1K1hH91tRhEjX8UagcAepHc+9UPjrTYNP1WG4tXM1rcxq/H9D4Bcf3B/KvP+h63qegXv3jT7qW2kI2kxt8r+zA8Ee9dP03X4PEbIZZXsbxRxlf5T/wC0/wBO78sftXOcjfGEupeMnG+Ek00jf/ZH0+O48T3czICbe3baxGQd7Kua+iy2OYnEiBgcgjHFfOH7PeqR6N4otmuHMcM8bRO/ReQGA+uQcfWvo2JSNvPrVTAXV6rkLbLUq00QbzR4Ls+Y0Y83jcSpyfqe1Yt/h75rHC4PTr/7rodKk9+tRLFnRkYswsm2H5ZPRkG8A2hUAoMDAqj1DwnHIpaInNdQwCMimHQAGiyaVeuxPVm2Q8M4Hf6NLZsQQSB3qBbxyTMERSzHoB1row063+cFACferG00a0h5WMN9etY0uG67OzOg/iDf5Ucx0zwhcXWJLkGKL064roGlaZBp0IjiQAjqasCRjpSCQelbuJgUYy7I5vMzrbVpvQkPubApJIHahI3pUfcSaTItjBbI75NepVQhWtQWjzd2Tsl1T7iG45pVuuTik7c9aQ9whU88VWk9jq4kmfC81FYVKktWbvTZs3jqEHNWFYyvJsUZLRHCZ60dSktSpB7UPT+lWVAptRjsj8Cnk6Uxg0tHZTtbgikOUdB8wQ+9ONSxHilFO1OTa8DnFaExxljVtbW4Aziq+FgD3qxhl4xjmtCh77srWrXcmQw7mzV7CmB7VWQycVPjfIrYqnqJRsl3LLyxLEW9BWb1K3yrfWrs45pu5jEkTj1FWrYKa0VLI7Wjnlw7Wt/DOvBR1VvdTg1MkiGDTOqQGBw67V5BBYZBqfFw3NeSZ+P8NltxfZnofEclDOw1bF76Tm+p+ENDv2Zp9OgMjclot0Rz67TilxeDdAtwBHpFoP8A5Iw/72rR+bTnqc0iqxTWkrpLXngxsijHul82JS8l+qMvefD6/wBMsZprLV9W85VJWCGba8n+1Ww2PpXOJZ57RYLS+uZ7OFycRyjKkjoAwyK66k2G5FNajpdpqdq8F1As8R6qw/Y+hrNysSDbsj3f/TXw8qzHXw9vp/5f/SJou2bS7eYsFZkBIHQ+tTwu09ap/BFtNp88+iTzyTw2a75AQD+I7QQeeOvXrwnJrVu6rk5xVyPYY4uKTRVXVr3aOCi3cA9zQqmqxGCOxqUbw3UOozFfIRQqpknuMnHG3p35qo1HwvpFtaiR3eS5kBZEfAGB033J3KPbHTrXRIdK06eXY0JaTcqoJTvZmbAADAkkjgDJq6hs7SE/ybWGP/bGq/8AFROxS7IknzVdMFCKSMSsVzCSWIu2wf5Z+Zyuc7Rgc8Z7dOtR5NS0qzl+7zS29vOMnynAOR0yB3Gea0j2ViWTdawEhvMG6NSC394xjPv0oQ2lrCscaQRiNDlBtGAfUD1/aghlz98OTXUrXa0XYVt25ZGcE8ZJA444AHPDZzxSLjXLO1Eu+UiZF+YFGCnvguVxg45647EGrD7vE3VFP1AofcYM58lAfXaBQCV3v5K7tJM+Jp9zLEr3DxeUJCA4YxlwQQMbsZxkg455BGCRL/jtgC2yz1NmO05jUspxg7TvwoJGMt25p9rOzk/Fbwt9Y1/5puTTdMkULJY2zDgcwoRxngUB6tv+wz/6hfEgGwtBuOAXuBgZGSQFGeATnrkA9RTTX+oFFd9J09VcEoWum3EA9duwYPpzUldG0eOQSx6faK45DLAoIIGMA49gKVHpWlxuyxafaIzdWWBQT+YFAOef+xFk1jVCCy6NbOdpIXz2OQDxvCoNvJOSRzgD1pmTX9QUECwscfdmlyzTgkt8oAK7c9Tycfh+prQfo0AjKC0txGVKlRGANpJJA4HGSSfqTPqwlpLu77QGOWwoGM8nbgDGeMnH0oDqv+6M3Ha67I6b9MtA2wPgXD7TuBH9HI42nNAXWrq5VrWwKkZG24yuSCoxhcjGeeepHarstboqILe3CKSVGyMbcjBI49aCWlqrbxbwgg5BCLg55znHqc0B1X/dEN9el85jZ6jO0XHH365wT0yq55HzHGcZ7jBEtL5pgDDoOq5Z9q7pbx84J4ztAI4PBwcVc/dLfzGk8iLzWAUtt+YgEkDPfBJOPc0pbS2ZizQRlmGCSpyR6Z9qXQ/rd/2itee8hiLNpV0pZkVVklcNliQFwBnqR0HPIpLzavIhjbSoxIVZgvnENwoJGQpAyQOmeSOnNXjWdoww0MZHoVFMnTbFiFa0gIXOBsHGeuPpzQHXf90RIL7VpI0c6NbrvRXIFy2U3DDfiyTt+bAxx3FDUNRayuLa0Gl2heZwu8zuVTJABbbgHGc4qwl0rTJSC9hbsRkgmJTye+feo40PTRKJRZQeYudrCMZH5+tKJvK/2FW13erbq4s9LkDSSogMspK73VQMoMdQ3PbFLtr7XXj3S2OlocqCFedhufqMttC4Cn1yT7VMGmacO1nDjptMa4/YU4LCyXpbwj2CL/xQHVkf7Fd/F9UcDy9LstuXJxMx3BTgfNswcEg88Y5HWkt4ouI5HRdKsS6oyqDNJwxUsFPC8jgdO4q3+42v/tJ/40f3Gz/9lP0oFe7PuioXxddgBRoljlmI/wCobIAK5Od2ACynBGeo9ajSeI9SZNw0OE4JGVnkB4JGcbcdVbPqp9DVz/D7L/2E/SlLYWa/9tPyxQHXZ92UW7XScr4YfDDHzXZGOfQpnvx+tKt/7TV33Bv/AIauHPGfvSkL/TP/ABUiSxt7WOSS2jSNZMLgD8QYgYHrkkfnQNEo9WSiH8Y9TQGc0bDLEUCECCQKhk0vt8obB70XTkUdGJFpHPdW8OBZUmt42YJLlwoJ2rlv1J4HuaklM09pEX3WdwflkkXc0TH+lvb/AJFPup2GmPJ3UdA82FDqGl26ueVXzZIlhT0SMKSPzBqSs0HmSRKQWQKXX0yTgfrilqjdnRrCZyLZHUcYGTwM0FJltTd/uCpOTKE9fz2y9hHZXR1DT5J1b5pIip+YeoBHH1AqbsiaJHljSSMggMCCM+lc9tpfHFpNm28MXGeBHdSDn86tbHxnqLQxJrXha/aYAbp7XZPGfcqHDD9KCOTsq/NF6+5fTLHISQkfVcj9+lCqiz8ZaIz7dV0ybSXzjfcKJIc+gkj3Y/NadikMkauBhT7YoJnOE/EmFjsOfanJAkKciJa4CIzYHYU2zEtQRKxT2IY4pVMd19aUOD+tJgmEb9aVLIMDFGFBFJbkEUi7jm1HwSXbHU0yh5o9+RxSlTnkU6M9Edr3HuCUxbThijkb2pMhHpToze9EsLIxI9pSSTnqxJ7f3piRRgMpyT0PapMcQlbcTzTZXkAHY1Apu6xyj4ZLjV8jcZDY3VIhwG+tMxqKej5JyaguVk+zLdb6VoQw5NFKPl4p0IPIzUUrz0NTk/JJCClNd0SyOhFRnXGc0qT5Rmk8mmULXZMsKTa0R5SR2ooztcHPAqQRxRbSTkVcctdmVJrUtMjs2aKnZhhaFOUyDT9xOKNHKjNNlsClA4rYjPsZ8ofYf3c4oZxTa5BowfalbBRaH1pTdDUYHgCngw7Ur2K5J+RbgEVFZGC08rEHmiU8ENJB1PIc09AOKj2/KBVJ14qKS2T1/mJR60KZR8U6j0x+SGcNoOiU9aTu4phW5xUqjn2Y2uQAHpTTNxSw1Ib1BpV3QTloeheOB9pNLG7rTKnJ5p0CneL22Vpa2SEc7sU6KioPnGKfBzUU22RzluI6vBpwN60gLS6Zt7DpO0OKwBpwHikgYNLL0kpNk0WkuyDJGKTnJpPXvSpDgelJKe0LuS8CHAwKFNhqFO3sZtjueMUYelBcUY6VEn3LS7joxS8cUgGjJPpQDktB5NGWpuhaA3y0O7vUheaWKZPJYrb1ot9Gpoo+DSiTT0/YnlJMIilD5qZDUsDmpYrRXl3Y6JKeHSo6U8pqqyeL12GMkCs1Y3DKRTMMYqbGucVBH9yXa6R0N1zSw4PekKvtRBRmn72QbT8iTniiPFGBRUdQJ9iSOaUvNNR0/GOM1XtkSQklsVnmjLUpGBFJcD0qNMmjFgpoVG3U+DSN+whI9hzIzRhs00DilYpz2xI6aDz70DzScYo1pbewUQs5NIzk0pjmm84oIJNMU/NChSaFOBkXvQDehoUKgH+AqBJoUKADJoiaTQoAN+tOJ0oUKA9xlvxU2LrQoVNEhk/YUKUIUKFPKrBelAUKFMYozQJ5oUKQEJfkUfajoUAP9h0dKP8VChQwQKNOlChQBEk70T9aFCgUDShQoUAJaioUKAAOlChQoA//9k=";

  // Effect to handle simulation state changes
  useEffect(() => {
    if (isSimulating && verificationProgress >= 99) {
      // Simulation completed - send mock image data and force completion
      onComplete(mockImageData);
    }
  }, [isSimulating, verificationProgress, onComplete, mockImageData]);
  
  // Add mouse tracking for face alignment simulation
  useEffect(() => {
    const trackMouseMovement = (e: MouseEvent) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    
    // For touch devices
    const trackTouchMovement = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        window.mouseX = e.touches[0].clientX;
        window.mouseY = e.touches[0].clientY;
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', trackMouseMovement);
    window.addEventListener('touchmove', trackTouchMovement);
    
    // Set initial values to center
    if (webcamRef.current && webcamRef.current.video) {
      const rect = webcamRef.current.video.getBoundingClientRect();
      window.mouseX = rect.left + rect.width / 2;
      window.mouseY = rect.top + rect.height / 2;
    }
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', trackMouseMovement);
      window.removeEventListener('touchmove', trackTouchMovement);
    };
  }, [webcamRef.current]);
  
  // Create the rays around the scanner circle
  const renderRays = () => {
    const rays = [];
    const rayCount = 30;
    
    for (let i = 0; i < rayCount; i++) {
      const rotation = (i * 360) / rayCount;
      rays.push(
        <div 
          key={i}
          className="absolute h-6 w-0.5 bg-[#273414] origin-bottom"
          style={{ 
            left: 'calc(50% - 1px)',
            bottom: '50%',
            transform: `rotate(${rotation}deg) translateY(-140px)`
          }}
        />
      );
    }
    
    return rays;
  };
  
  // Determine the size based on mobile status
  const videoConstraints = {
    width: isMobile ? 280 : 400,
    height: isMobile ? 350 : 400,
    facingMode: "user"
  };
  
  // Track face position relative to center to give feedback
  const [facePosition, setFacePosition] = useState<string>("center");
  
  // Update face position based on mouse/touch position
  useEffect(() => {
    const updatePosition = () => {
      if (!window.mouseX || !window.mouseY) return;
      
      const videoEl = webcamRef.current?.video;
      if (!videoEl) return;
      
      const rect = videoEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = window.mouseX - centerX;
      const distanceY = window.mouseY - centerY;
      
      // Determine position based on distance from center
      if (Math.abs(distanceX) < rect.width * 0.15 && Math.abs(distanceY) < rect.height * 0.15) {
        setFacePosition("center");
      } else {
        // Determine cardinal direction
        const angleRad = Math.atan2(distanceY, distanceX);
        const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;
        
        // Map angle to position instruction
        if (angleDeg >= 337.5 || angleDeg < 22.5) {
          setFacePosition("move left");
        } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
          setFacePosition("move up and left");
        } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
          setFacePosition("move up");
        } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
          setFacePosition("move up and right");
        } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
          setFacePosition("move right");
        } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
          setFacePosition("move down and right");
        } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
          setFacePosition("move down");
        } else {
          setFacePosition("move down and left");
        }
      }
    };
    
    const interval = setInterval(updatePosition, 200);
    return () => clearInterval(interval);
  }, [webcamRef.current]);
  
  // Generates instructional text based on progress and face position
  const getInstructionText = () => {
    if (verificationProgress >= 90) {
      return "Verification complete!";
    }
    
    if (verificationProgress < 30) {
      if (facePosition === "center") {
        return "Great! Stay centered";
      } else {
        return `Please ${facePosition}`;
      }
    } else if (verificationProgress < 60) {
      return facePosition === "center" 
        ? "Hold still while we scan" 
        : `Keep centered, ${facePosition}`;
    } else {
      return facePosition === "center"
        ? "Almost there, keep steady"
        : "Stay centered to complete";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Instruction text */}
      <div className="mb-4 text-center">
        <p className="text-lg font-medium text-[#273414]">{getInstructionText()}</p>
        <p className="text-sm text-gray-500">
          {verificationProgress < 100 ? "Move your cursor to align with the crosshair" : ""}
        </p>
      </div>
      
      {/* Scanner rays */}
      <div className="relative w-72 h-72 mb-4">
        {renderRays()}
        
        {/* Webcam container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-[#273414]/30 overflow-hidden relative flex items-center justify-center">
            {/* Scanner lines effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/10 to-transparent bg-repeat-y" 
                style={{ 
                  backgroundSize: "100% 8px",
                  backgroundImage: "linear-gradient(to bottom, rgba(39,52,20,0.1), rgba(39,52,20,0.1) 1px, transparent 1px, transparent 4px)",
                  animation: "scanAnimation 1.5s linear infinite"
                }}
            />
            
            {/* Camera feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hasPermission === false && (
                <div className="text-white/80 text-center p-4 bg-black/50 w-full h-full flex items-center justify-center">
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-3 text-[#91c35c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15.5 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                      <path d="M11.5 14.2c-.8.5-1.7.8-2.5.8-2.2 0-4-2.2-4-5s1.8-5 4-5c.8 0 1.7.3 2.5.8" />
                      <path d="m21 8-3.3 1.7M16 12l4-.1M16.7 16.2 20 18" />
                      <path d="M2 12h5" />
                      <path d="M13 21c-1.2-1-2-2.4-2-4s.8-3 2-4" />
                    </svg>
                    
                    <p className="text-white font-medium mb-1">Camera access required</p>
                    <p className="text-sm text-white/80 mb-3">For security purposes, we need to verify your identity</p>
                    
                    <button 
                      onClick={() => {
                        if (!isSimulating) {
                          demoSimulationRef.current = simulateVerification();
                          setIsSimulating(true);
                        }
                      }}
                      className="mx-auto bg-[#91c35c] text-white py-2 px-3 rounded-lg text-sm font-medium w-max hover:bg-[#7dac4c] transition-colors"
                    >
                      {isSimulating ? "Demo mode: Auto-completing..." : "Continue with Demo Mode"}
                    </button>
                  </div>
                </div>
              )}
              
              {hasPermission === true && (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scale(-1, 1)" // Mirror the webcam
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Verification progress ring */}
        <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 290 290">
          <motion.circle
            className="text-[#273414]"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="142"
            cx="145"
            cy="145"
            strokeDasharray="892"
            initial={{ strokeDashoffset: 892 }}
            animate={{ 
              strokeDashoffset: isComplete ? 0 : 892 * (1 - verificationProgress / 100) 
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        {/* Alignment guides */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#91c35c] z-20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#91c35c] z-20"></div>
        
        {/* Complete overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-[#273414]/60 flex items-center justify-center z-30">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full animate-pulse bg-white/10"></div>
              <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
