"use client"

interface DiverLoaderProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export default function DiverLoader({ message = "Loading...", size = "md" }: DiverLoaderProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-300 via-blue-500 to-indigo-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-800/40 animate-pulse"></div>
        {[...Array(6)].map((_, i) => (
          <div
            key={`caustic-${i}`}
            className="absolute rounded-full bg-gradient-radial from-cyan-300/30 to-transparent blur-sm"
            style={{
              width: `${60 + Math.random() * 120}px`,
              height: `${60 + Math.random() * 120}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: "float",
              animationDuration: `${4 + Math.random() * 3}s`,
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute bg-gradient-to-b from-yellow-200/40 via-yellow-300/20 to-transparent"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: "100%",
              left: `${15 + i * 18}%`,
              transform: `rotate(${-10 + Math.random() * 20}deg)`,
              animationName: "shimmer",
              animationDuration: `${3 + Math.random() * 2}s`,
              animationIterationCount: "infinite",
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`fish-${i}`}
            className="absolute"
            style={{
              left: `${-20 + (i % 3) * 40}%`,
              top: `${20 + (i % 4) * 15}%`,
              animationName: "swim",
              animationDuration: `${6 + Math.random() * 4}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div className="relative transform scale-75">
              <div className="w-8 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full relative shadow-lg">
                <div className="absolute -right-2 top-0 w-3 h-4 bg-orange-500 rounded-r-full transform rotate-45"></div>
                <div className="absolute left-2 top-1 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute -top-1 left-3 w-2 h-1 bg-orange-600 rounded-full"></div>
                <div className="absolute -bottom-1 left-3 w-2 h-1 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={`jellyfish-${i}`}
            className="absolute"
            style={{
              left: `${70 + i * 10}%`,
              top: `${10 + i * 20}%`,
              animationName: "jellyFloat",
              animationDuration: `${5 + Math.random() * 3}s`,
              animationIterationCount: "infinite",
              animationDelay: `${i * 1.5}s`,
            }}
          >
            <div className="relative">
              <div className="w-6 h-4 bg-gradient-to-b from-pink-300/60 to-pink-500/40 rounded-full relative">
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="w-0.5 bg-pink-400/50 absolute"
                      style={{
                        height: `${8 + Math.random() * 6}px`,
                        left: `${-6 + j * 3}px`,
                        animationName: "tentacle",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: `${j * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <div className={`relative ${sizeClasses[size]} mx-auto mb-8`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{
                animationName: "diverSwim",
                animationDuration: "4s",
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
              }}
            >
              <div className="absolute -right-4 top-3 w-5 h-12 bg-gradient-to-b from-gray-400 to-gray-700 rounded-full shadow-xl border-2 border-gray-500">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-300 rounded-t-full"></div>
                <div className="absolute top-2 right-0 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute top-4 right-0 w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <div className="w-12 h-20 bg-gradient-to-b from-cyan-500 to-cyan-800 rounded-full relative shadow-2xl border border-cyan-400">
                {/* Enhanced head with diving mask */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full shadow-lg"></div>

                {/* Professional diving mask */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-gray-900 to-black rounded-lg border-2 border-gray-600 shadow-lg">
                  <div className="absolute inset-1 bg-blue-400/40 rounded"></div>
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-gray-700 rounded-full"></div>
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-gray-700 rounded-full"></div>
                </div>

                <div
                  className="absolute top-4 -left-4 w-4 h-8 bg-gradient-to-b from-cyan-500 to-cyan-800 rounded-full origin-top"
                  style={{
                    animationName: "armSwim",
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                  }}
                ></div>
                <div
                  className="absolute top-4 -right-4 w-4 h-8 bg-gradient-to-b from-cyan-500 to-cyan-800 rounded-full origin-top"
                  style={{
                    animationName: "armSwim",
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                    animationDelay: "1s",
                  }}
                ></div>

                {/* Enhanced legs with realistic proportions */}
                <div className="absolute bottom-0 left-3 w-4 h-10 bg-gradient-to-b from-cyan-500 to-cyan-800 rounded-full"></div>
                <div className="absolute bottom-0 right-3 w-4 h-10 bg-gradient-to-b from-cyan-500 to-cyan-800 rounded-full"></div>

                <div className="absolute -bottom-4 left-2 w-6 h-4 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full shadow-lg border border-yellow-600"></div>
                <div className="absolute -bottom-4 right-2 w-6 h-4 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full shadow-lg border border-yellow-600"></div>

                {/* Wetsuit details */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-10 bg-gray-400 rounded-full"></div>
                <div className="absolute top-6 left-2 w-2 h-1 bg-cyan-300 rounded-full"></div>
                <div className="absolute top-6 right-2 w-2 h-1 bg-cyan-300 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={`bubble-${i}`}
                className="absolute bg-gradient-to-t from-blue-200/60 to-blue-100/80 rounded-full border border-blue-300/40 shadow-sm"
                style={{
                  width: `${3 + Math.random() * 6}px`,
                  height: `${3 + Math.random() * 6}px`,
                  left: `${45 + Math.random() * 15}%`,
                  top: `${60 + Math.random() * 30}%`,
                  animationName: "bubbleRise",
                  animationDuration: `${2 + Math.random() * 2}s`,
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.3}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-yellow-900/50 via-yellow-800/30 to-transparent"></div>

          {/* Treasure chest */}
          <div className="absolute bottom-2 left-1/4 w-6 h-4 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded border border-yellow-700">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 rounded-t"></div>
            <div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>

          {/* Animated seaweed */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`seaweed-${i}`}
              className="absolute bottom-0 bg-gradient-to-t from-green-700 to-green-500 rounded-t-full"
              style={{
                width: `${2 + Math.random()}px`,
                height: `${12 + Math.random() * 8}px`,
                left: `${20 + i * 20}%`,
                animationName: "seaweedSway",
                animationDuration: `${3 + Math.random() * 2}s`,
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Coral formations */}
          <div className="absolute bottom-0 right-1/3 w-4 h-6 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-lg"></div>
          <div className="absolute bottom-0 right-1/4 w-3 h-4 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-full"></div>
        </div>

        <div className="text-center relative z-10 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-white font-bold text-xl mb-4 drop-shadow-2xl tracking-wide">{message}</p>
          <div className="flex justify-center space-x-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-gradient-to-t from-cyan-400 to-cyan-200 rounded-full shadow-xl border-2 border-cyan-300"
                style={{
                  animationName: "bounce",
                  animationDuration: "1.5s",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bubbleRise {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-30vh) translateX(15px) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-60vh) translateX(-10px) scale(0.6);
            opacity: 0;
          }
        }

        @keyframes diverSwim {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }

        @keyframes armSwim {
          0%, 100% {
            transform: rotate(15deg);
          }
          50% {
            transform: rotate(-15deg);
          }
        }

        @keyframes swim {
          0% {
            transform: translateX(-100px) translateY(0);
          }
          50% {
            transform: translateX(50vw) translateY(-20px);
          }
          100% {
            transform: translateX(120vw) translateY(10px);
          }
        }

        @keyframes jellyFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-15px) translateX(10px);
          }
          66% {
            transform: translateY(-5px) translateX(-5px);
          }
        }

        @keyframes tentacle {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        @keyframes seaweedSway {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
