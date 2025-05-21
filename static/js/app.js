
// app.js - Frontend logic for hybrid authentication

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Authentication method switching
    const methodButtons = document.querySelectorAll('.method-btn');
    const methodContents = document.querySelectorAll('.method-content');
    
    methodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const methodName = button.getAttribute('data-method');
            
            // Update active method button
            methodButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active method content
            methodContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${methodName}-method`).classList.add('active');
        });
    });
    
    // Camera handling for registration
    const registerVideo = document.getElementById('register-video');
    const registerCanvas = document.getElementById('register-canvas');
    const startRegisterCameraBtn = document.getElementById('start-register-camera');
    const captureRegisterBtn = document.getElementById('capture-register');
    let registerStream = null;
    
    startRegisterCameraBtn.addEventListener('click', async () => {
        try {
            registerStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            registerVideo.srcObject = registerStream;
            startRegisterCameraBtn.disabled = true;
            captureRegisterBtn.disabled = false;
        } catch (err) {
            showResult('register-result', `Camera error: ${err.message}`, false);
        }
    });
    
    captureRegisterBtn.addEventListener('click', () => {
        const context = registerCanvas.getContext('2d');
        registerCanvas.width = registerVideo.videoWidth;
        registerCanvas.height = registerVideo.videoHeight;
        context.drawImage(registerVideo, 0, 0, registerCanvas.width, registerCanvas.height);
        
        // Enable the register button
        document.getElementById('register-submit').disabled = false;
        
        // Stop the camera
        if (registerStream) {
            registerStream.getTracks().forEach(track => track.stop());
            registerStream = null;
        }
        
        // Reset buttons
        startRegisterCameraBtn.disabled = false;
        captureRegisterBtn.disabled = true;
    });
    
    // Camera handling for verification
    const verifyVideo = document.getElementById('verify-video');
    const verifyCanvas = document.getElementById('verify-canvas');
    const startVerifyCameraBtn = document.getElementById('start-verify-camera');
    const captureVerifyBtn = document.getElementById('capture-verify');
    let verifyStream = null;
    
    startVerifyCameraBtn.addEventListener('click', async () => {
        try {
            verifyStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            verifyVideo.srcObject = verifyStream;
            startVerifyCameraBtn.disabled = true;
            captureVerifyBtn.disabled = false;
            
            // Simulate scanning progress
            simulateScanProgress();
        } catch (err) {
            showResult('verify-result', `Camera error: ${err.message}`, false);
        }
    });
    
    captureVerifyBtn.addEventListener('click', () => {
        const context = verifyCanvas.getContext('2d');
        verifyCanvas.width = verifyVideo.videoWidth;
        verifyCanvas.height = verifyVideo.videoHeight;
        context.drawImage(verifyVideo, 0, 0, verifyCanvas.width, verifyCanvas.height);
        
        // Enable the verify button
        document.getElementById('verify-submit').disabled = false;
        
        // Stop the camera
        if (verifyStream) {
            verifyStream.getTracks().forEach(track => track.stop());
            verifyStream = null;
        }
        
        // Reset buttons
        startVerifyCameraBtn.disabled = false;
        captureVerifyBtn.disabled = true;
    });
    
    // File upload for registration
    const registerFileInput = document.getElementById('register-file');
    
    registerFileInput.addEventListener('change', () => {
        if (registerFileInput.files.length > 0) {
            document.getElementById('register-submit').disabled = false;
        }
    });
    
    // File upload for verification
    const verifyFileInput = document.getElementById('verify-file');
    
    verifyFileInput.addEventListener('change', () => {
        if (verifyFileInput.files.length > 0) {
            document.getElementById('verify-submit').disabled = false;
        }
    });
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('register-user-id').value;
            if (!userId) {
                showResult('register-result', 'User ID is required', false);
                return;
            }
            
            const formData = new FormData();
            formData.append('user_id', userId);
            
            // Check if we have a captured image or file upload
            if (registerCanvas.width > 0) {
                // Convert canvas to blob
                registerCanvas.toBlob(async (blob) => {
                    formData.append('file', blob, 'capture.jpg');
                    await submitRegistration(formData);
                }, 'image/jpeg');
            } else if (registerFileInput.files.length > 0) {
                formData.append('file', registerFileInput.files[0]);
                await submitRegistration(formData);
            } else {
                showResult('register-result', 'Please capture or upload an image', false);
            }
        });
    }
    
    // Verify form submission
    const verifyForm = document.getElementById('verify-form');
    
    if (verifyForm) {
        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('verify-user-id').value;
            if (!userId) {
                showResult('verify-result', 'User ID is required', false);
                return;
            }
            
            const formData = new FormData();
            formData.append('user_id', userId);
            
            // Check if we have a captured image or file upload
            if (verifyCanvas.width > 0) {
                // Convert canvas to blob
                verifyCanvas.toBlob(async (blob) => {
                    formData.append('file', blob, 'capture.jpg');
                    await submitVerification(formData);
                }, 'image/jpeg');
            } else if (verifyFileInput.files.length > 0) {
                formData.append('file', verifyFileInput.files[0]);
                await submitVerification(formData);
            } else {
                showResult('verify-result', 'Please capture or upload an image', false);
            }
        });
    }
    
    // Apple FaceID authentication
    const appleAuthBtn = document.getElementById('apple-auth-btn');
    
    if (appleAuthBtn) {
        appleAuthBtn.addEventListener('click', async () => {
            const userId = document.getElementById('apple-user-id').value;
            if (!userId) {
                showResult('verify-result', 'User ID is required', false);
                return;
            }
            
            // Simulate FaceID prompt
            showResult('verify-result', 'FaceID authentication in progress...', true);
            
            try {
                // In a real implementation, this would use the Web Authentication API
                // For demo purposes, we'll simulate the native auth
                setTimeout(async () => {
                    const response = await fetch('/verify_native', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            platform: 'apple',
                            auth_token: 'simulated_faceid_token'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.verified) {
                        showResult('verify-result', `Authentication successful using ${data.method}`, true);
                    } else {
                        showResult('verify-result', data.error || 'Authentication failed', false);
                    }
                }, 2000);
            } catch (error) {
                showResult('verify-result', `Error: ${error.message}`, false);
            }
        });
    }
    
    // Google Biometric authentication
    const googleAuthBtn = document.getElementById('google-auth-btn');
    
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            const userId = document.getElementById('google-user-id').value;
            if (!userId) {
                showResult('verify-result', 'User ID is required', false);
                return;
            }
            
            // Simulate Google biometric prompt
            showResult('verify-result', 'Biometric authentication in progress...', true);
            
            try {
                // In a real implementation, this would use the Credential Management API
                // For demo purposes, we'll simulate the native auth
                setTimeout(async () => {
                    const response = await fetch('/verify_native', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            platform: 'google',
                            auth_token: 'simulated_biometric_token'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.verified) {
                        showResult('verify-result', `Authentication successful using ${data.method}`, true);
                    } else {
                        showResult('verify-result', data.error || 'Authentication failed', false);
                    }
                }, 2000);
            } catch (error) {
                showResult('verify-result', `Error: ${error.message}`, false);
            }
        });
    }
    
    // Load users list
    const refreshUsersBtn = document.getElementById('refresh-users');
    
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', loadUsers);
        
        // Load users on tab switch to users
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === 'users') {
                button.addEventListener('click', loadUsers);
            }
        });
        
        // Initial users load
        loadUsers();
    }
    
    // Helper functions
    async function submitRegistration(formData) {
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showResult('register-result', `User ${data.user_id} registered successfully!`, true);
                registerForm.reset();
                document.getElementById('register-submit').disabled = true;
            } else {
                showResult('register-result', data.error || 'Registration failed', false);
            }
        } catch (error) {
            showResult('register-result', `Error: ${error.message}`, false);
        }
    }
    
    async function submitVerification(formData) {
        try {
            const response = await fetch('/verify', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.verified) {
                    showResult('verify-result', `Identity verified successfully! (Model: ${data.model}, Distance: ${data.distance.toFixed(4)})`, true);
                } else {
                    showResult('verify-result', `Identity verification failed. Face does not match. (Distance: ${data.distance.toFixed(4)}, Threshold: ${data.threshold.toFixed(4)})`, false);
                }
                verifyForm.reset();
                document.getElementById('verify-submit').disabled = true;
            } else {
                showResult('verify-result', data.error || 'Verification failed', false);
            }
        } catch (error) {
            showResult('verify-result', `Error: ${error.message}`, false);
        }
    }
    
    async function loadUsers() {
        try {
            const response = await fetch('/users');
            const data = await response.json();
            
            const usersList = document.getElementById('users-list');
            
            if (data.success && data.users.length > 0) {
                let html = '';
                
                data.users.forEach(userId => {
                    html += `
                        <div class="user-item">
                            <div class="user-avatar">
                                <img src="/registered_faces/${userId}.jpg" alt="${userId}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22 viewBox=%220 0 50 50%22><circle cx=%2225%22 cy=%2225%22 r=%2220%22 fill=%22%23ccc%22/><text x=%2225%22 y=%2230%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23666%22>${userId[0]}</text></svg>'">
                            </div>
                            <div class="user-info">
                                <div class="user-id">${userId}</div>
                            </div>
                            <div class="user-actions">
                                <button onclick="document.getElementById('verify-user-id').value='${userId}'; document.querySelector('.tab-btn[data-tab=\\'verify\\']').click();">Verify</button>
                            </div>
                        </div>
                    `;
                });
                
                usersList.innerHTML = html;
            } else {
                usersList.innerHTML = '<p>No users registered yet.</p>';
            }
        } catch (error) {
            document.getElementById('users-list').innerHTML = `<p>Error loading users: ${error.message}</p>`;
        }
    }
    
    function showResult(elementId, message, isSuccess) {
        const resultElement = document.getElementById(elementId);
        if (!resultElement) return;
        
        resultElement.textContent = message;
        resultElement.className = 'result-container';
        
        if (isSuccess) {
            resultElement.classList.add('success');
        } else {
            resultElement.classList.add('error');
        }
    }
    
    function simulateScanProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (!progressBar || !progressText) return;
        
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                if (captureVerifyBtn) {
                    captureVerifyBtn.click();
                }
            }
        }, 200);
        
        // Clear interval if camera is stopped
        if (captureVerifyBtn) {
            captureVerifyBtn.addEventListener('click', () => {
                clearInterval(interval);
            });
        }
    }
});
