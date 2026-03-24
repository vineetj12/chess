import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='text-center lg:text-left'>
            <h1 className='text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 mb-6'>
              Chess Master
            </h1>
            <p className='text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed'>
              Play chess on the world's most beautiful chess platform. 
              Challenge opponents from around the globe and master the ancient game of strategy.
            </p>
            <div className='space-y-4'>
              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <button 
                  onClick={() => navigate("/game")}
                  className='bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
                >
                  🎯 Play Online
                </button>
                <button 
                  className='bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
                >
                  📚 Learn Chess
                </button>
              </div>
              <div className='text-gray-400 text-sm text-center lg:text-left'>
                No downloads required • Free to play • Real-time multiplayer
              </div>
            </div>
          </div>
          
          <div className='flex justify-center'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300'></div>
              <img 
                className="max-w-lg w-full h-auto rounded-2xl shadow-2xl border-4 border-white/20 group-hover:border-amber-400/50 transition-colors duration-300 transform group-hover:scale-105"
                src={'/chessboard.jpeg'} 
                alt="Chess Board"
              />
              <div className='absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20'>
                <div className='text-amber-200 font-bold text-sm'>Live Games</div>
                <div className='text-white text-lg font-mono'>2,147</div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105'>
            <div className='text-4xl mb-4'>♟️</div>
            <h3 className='text-xl font-bold mb-2 text-amber-100'>Classic Chess</h3>
            <p className='text-gray-300'>Master the timeless game with traditional rules and strategies.</p>
          </div>
          
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105'>
            <div className='text-4xl mb-4'>⚡</div>
            <h3 className='text-xl font-bold mb-2 text-amber-100'>Fast Matches</h3>
            <p className='text-gray-300'>Quick games for when you have just a few minutes to play.</p>
          </div>
          
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105'>
            <div className='text-4xl mb-4'>🏆</div>
            <h3 className='text-xl font-bold mb-2 text-amber-100'>Tournaments</h3>
            <p className='text-gray-300'>Compete in exciting tournaments and climb the leaderboards.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
