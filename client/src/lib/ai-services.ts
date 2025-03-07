import React from "react";

// Function to get AI service icon based on service name
export function getAiServiceIcon(serviceName: string): React.ReactNode {
  // This would ideally use proper SVG icons for each service
  // but we're using stylized letters for simplicity
  
  switch (serviceName.toLowerCase()) {
    case "openai":
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      }, 
        React.createElement("path", {
          d: "M21.4 14.52C22.24 13.4 22.75 12.25 22.75 10.95C22.75 7.35 19.1 4.7 16.04 6.2C14.6 3.06 11.3 1.59 8.04 2.99C4.94 4.32 3.46 7.8 4.59 10.98C1.8 11.97 0.75 15.07 2.35 17.49C3.92 19.87 7.21 20.41 9.49 18.59C10.92 21.72 14.23 23.19 17.48 21.8C20.57 20.48 22.06 17 20.93 13.83C21.13 14.05 21.31 14.28 21.4 14.52Z",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5",
          strokeMiterlimit: "10",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        })
      );
    case "claude":
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      }, 
        React.createElement("path", {
          d: "M12 2L3 7V17L12 22L21 17V7L12 2Z",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("path", {
          d: "M12 6L7.5 8.5V13.5L12 16L16.5 13.5V8.5L12 6Z",
          fill: "#FFFFFF",
          stroke: "#000000",
          strokeWidth: "1.5"
        })
      );
    case "perplexity":
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      },
        React.createElement("path", {
          d: "M12 3L3 6V14L12 18L21 14V6L12 3Z",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("path", {
          d: "M7 10L12 13L17 10",
          stroke: "#FFFFFF",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        }),
        React.createElement("path", {
          d: "M12 13V19",
          stroke: "#000000",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        })
      );
    case "gemini":
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      },
        React.createElement("circle", {
          cx: "7",
          cy: "7",
          r: "5",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("circle", {
          cx: "17",
          cy: "17",
          r: "5",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("path", {
          d: "M10 10L14 14",
          stroke: "#000000",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        })
      );
    case "deepmind":
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      },
        React.createElement("path", {
          d: "M4 7L12 3L20 7V17L12 21L4 17V7Z",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("path", {
          d: "M12 12L12 21",
          stroke: "#FFFFFF",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        }),
        React.createElement("path", {
          d: "M12 12L20 7",
          stroke: "#FFFFFF",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        }),
        React.createElement("path", {
          d: "M12 12L4 7",
          stroke: "#FFFFFF",
          strokeWidth: "1.5", 
          strokeLinecap: "round"
        })
      );
    default:
      return React.createElement("svg", { 
        viewBox: "0 0 24 24", 
        fill: "none", 
        xmlns: "http://www.w3.org/2000/svg" 
      },
        React.createElement("rect", {
          x: "3",
          y: "3",
          width: "18",
          height: "18",
          rx: "3",
          fill: "#1E3C0D",
          stroke: "#000000",
          strokeWidth: "1.5"
        }),
        React.createElement("path", {
          d: "M12 8V16",
          stroke: "#FFFFFF",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        }),
        React.createElement("path", {
          d: "M8 12H16",
          stroke: "#FFFFFF",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        })
      );
  }
}

// List of available AI services
export const availableAiServices = [
  {
    id: "openai",
    name: "Open AI",
    description: "Connect with GPT models for language generation and more."
  },
  {
    id: "claude",
    name: "Claude",
    description: "Access Anthropic's conversational AI for interactive assistance."
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Gain insights through web-aware searching and analysis."
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Use Google's multimodal AI for various tasks."
  },
  {
    id: "deepmind",
    name: "DeepMind",
    description: "Leverage advanced AI research technologies."
  }
];
