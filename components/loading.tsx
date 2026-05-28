"use client"

interface LoadingProps {
  message?: string
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100 flex items-center justify-center">
      <div className="relative">
        {/* Water waves background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        {/* Main loader container */}
        <div className="relative z-10 text-center">
          {/* Diver with oxygen tank */}
          <div className="relative mb-8">
            {/* Oxygen tank */}
            <div className="absolute -left-8 top-4 w-4 h-12 bg-gray-600 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mt-1"></div>
              <div className="w-3 h-1 bg-gray-500 rounded mx-auto mt-1"></div>
            </div>

            {/* Diver silhouette */}
            <div className="w-16 h-16 mx-auto relative animate-bounce">
              {/* Head */}
              <div className="w-8 h-8 bg-cyan-700 rounded-full mx-auto mb-1 relative">
                {/* Diving mask */}
                <div className="absolute inset-1 bg-cyan-800 rounded-full border-2 border-cyan-600"></div>
              </div>

              {/* Body */}
              <div className="w-6 h-8 bg-cyan-700 rounded-lg mx-auto relative">
                {/* Arms */}
                <div className="absolute -left-2 top-1 w-3 h-1 bg-cyan-700 rounded transform rotate-45"></div>
                <div className="absolute -right-2 top-1 w-3 h-1 bg-cyan-700 rounded transform -rotate-45"></div>
              </div>

              {/* Legs/Fins */}
              <div className="flex justify-center gap-1 mt-1">
                <div className="w-2 h-4 bg-cyan-700 rounded"></div>
                <div className="w-2 h-4 bg-cyan-700 rounded"></div>
              </div>
              <div className="flex justify-center gap-1">
                <div className="w-4 h-2 bg-cyan-600 rounded-full"></div>
                <div className="w-4 h-2 bg-cyan-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Bubbles */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="bubble bubble1"></div>
            <div className="bubble bubble2"></div>
            <div className="bubble bubble3"></div>
            <div className="bubble bubble4"></div>
            <div className="bubble bubble5"></div>
          </div>

          {/* Loading text */}
          <h2 className="text-2xl font-bold text-cyan-800 mb-2">{message}</h2>
          <div className="flex justify-center items-center space-x-1">
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>

        {/* CSS Styles */}
        <style jsx>{`
          .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 100px;
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.2));
            border-radius: 50% 50% 0 0;
            animation: wave 3s ease-in-out infinite;
          }
          
          .wave1 {
            animation-delay: 0s;
            opacity: 0.3;
          }
          
          .wave2 {
            animation-delay: -1s;
            opacity: 0.2;
            height: 80px;
          }
          
          .wave3 {
            animation-delay: -2s;
            opacity: 0.1;
            height: 60px;
          }
          
          @keyframes wave {
            0%, 100% {
              transform: translateX(-50%) translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateX(-50%) translateY(-20px) rotate(180deg);
            }
          }
          
          .bubble {
            position: absolute;
            width: 8px;
            height: 8px;
            background: rgba(59, 130, 246, 0.6);
            border-radius: 50%;
            animation: bubble 2s ease-in-out infinite;
          }
          
          .bubble1 {
            left: -20px;
            animation-delay: 0s;
            width: 6px;
            height: 6px;
          }
          
          .bubble2 {
            left: -10px;
            animation-delay: 0.3s;
            width: 8px;
            height: 8px;
          }
          
          .bubble3 {
            left: 0px;
            animation-delay: 0.6s;
            width: 4px;
            height: 4px;
          }
          
          .bubble4 {
            left: 10px;
            animation-delay: 0.9s;
            width: 7px;
            height: 7px;
          }
          
          .bubble5 {
            left: 20px;
            animation-delay: 1.2s;
            width: 5px;
            height: 5px;
          }
          
          @keyframes bubble {
            0% {
              transform: translateY(0px);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
