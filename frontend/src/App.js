import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [proposalData, setProposalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proposalId, setProposalId] = useState(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [showSecretRevealed, setShowSecretRevealed] = useState(false);

  // Barzan's secret confession data for Maryam
  const secretConfession = {
    partner_name: "Maryam",
    proposer_name: "Barzan",
    message: "Maryam, you don't know me yet, but I've admired you from afar. Your smile brightens my day, and your kindness touches my heart. I dream of the day when I can tell you how I feel. You are the most beautiful person I've ever seen, and I would be honored if you would give me a chance to know you better.",
    our_story: [
      {
        date: "First Sight",
        description: "The moment I first saw you, time stood still. Your beauty captured my heart instantly."
      },
      {
        date: "Silent Admiration",
        description: "Every day I watch from afar, hoping to catch a glimpse of your radiant smile."
      },
      {
        date: "Growing Feelings",
        description: "My feelings for you grow stronger each day. You are always in my thoughts."
      },
      {
        date: "This Moment",
        description: "Today I find the courage to reveal my secret and share my heart with you."
      }
    ]
  };

  useEffect(() => {
    setProposalData(secretConfession);
  }, []);

  const handleRevealSecret = () => {
    setShowSecretRevealed(true);
    setTimeout(() => {
      setCurrentScreen('hero');
    }, 2000);
  };

  const handleProposalResponse = async (response) => {
    if (!proposalId) {
      // Create a new proposal first
      try {
        setIsLoading(true);
        const createResponse = await fetch(`${BACKEND_URL}/api/proposals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(proposalData)
        });
        
        const createResult = await createResponse.json();
        if (createResult.success) {
          setProposalId(createResult.proposal_id);
          await submitResponse(createResult.proposal_id, response);
        }
      } catch (error) {
        console.error('Error creating proposal:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      await submitResponse(proposalId, response);
    }
  };

  const submitResponse = async (id, response) => {
    try {
      setIsLoading(true);
      const responseData = {
        proposal_id: id,
        response: response,
        message: response === 'yes' ? 'Yes! I would love to get to know you!' : 'I need some time to think about this.'
      };

      const submitResponse = await fetch(`${BACKEND_URL}/api/proposals/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData)
      });

      const result = await submitResponse.json();
      if (result.success) {
        setResponseSubmitted(true);
        setCurrentScreen(response === 'yes' ? 'celebration' : 'understanding');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (section) => {
    setCurrentScreen(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-hearts-splash">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`heart-splash heart-splash-${i + 1}`}>💝</div>
            ))}
          </div>
          <div className="floating-stars">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`star star-${i + 1}`}>✨</div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1649297315673-873057ccc137" 
              alt="Cartoon couple"
              className="w-32 h-32 mx-auto rounded-full shadow-lg animate-bounce-slow"
            />
          </div>

          <h1 className="font-script text-4xl md:text-6xl text-purple-700 mb-8 animate-fade-in-up">
            Kuch Khaas Baat Hai...
          </h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 mb-8 animate-fade-in-up animation-delay-500">
            <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
              "Mohabbat sirf naseeb walon ko milti hai,
              <br />
              aur main chahta hun ke mera naseeb tum ho"
            </p>
            <p className="text-sm text-gray-500 mt-4">
              (Love is only for the fortunate ones, and I want you to be my fortune)
            </p>
          </div>

          {!showSecretRevealed ? (
            <button
              onClick={handleRevealSecret}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                       text-white px-12 py-4 rounded-full text-xl font-bold transform hover:scale-105 
                       transition-all duration-300 shadow-lg animate-pulse"
            >
              Reveal the Secret 💖
            </button>
          ) : (
            <div className="animate-fade-in-up">
              <div className="text-4xl mb-4">💕</div>
              <p className="text-2xl text-purple-600 font-medium">
                Get ready for something special...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mt-4"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!proposalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600 text-lg">Loading something special...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Floating Hearts Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        <div className="floating-hearts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`heart heart-${i + 1}`}>💖</div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => scrollToSection('hero')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentScreen === 'hero' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('feelings')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentScreen === 'feelings' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              My Feelings
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentScreen === 'gallery' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Dreams
            </button>
            <button
              onClick={() => scrollToSection('confession')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentScreen === 'confession' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              My Heart
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-rose-200"></div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <div className="mb-8">
            <img 
              src="https://images.pexels.com/photos/7083127/pexels-photo-7083127.jpeg" 
              alt="Love cartoon"
              className="w-48 h-48 mx-auto rounded-full shadow-lg animate-float"
            />
          </div>

          <h1 className="font-script text-6xl md:text-8xl mb-8 animate-fade-in-up text-purple-700">
            Barzan
            <span className="block text-4xl md:text-6xl mt-4 text-pink-600">💕</span>
            Maryam
          </h1>
          <p className="text-xl md:text-2xl mb-12 animate-fade-in-up animation-delay-500 leading-relaxed text-gray-700">
            A Secret Love Story That Begins Now
          </p>
          <button
            onClick={() => scrollToSection('feelings')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                     text-white px-8 py-4 rounded-full text-lg font-medium transform hover:scale-105 
                     transition-all duration-300 shadow-lg animate-fade-in-up animation-delay-1000"
          >
            Discover My Feelings 💝
          </button>
        </div>
      </section>

      {/* My Feelings Section */}
      <section id="feelings" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-script text-5xl text-center text-purple-600 mb-16">My Heart's Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {proposalData.our_story.map((chapter, index) => (
                <div key={index} className="flex items-center space-x-8 animate-slide-in-left">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full 
                                  flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">{chapter.date}</h3>
                    <p className="text-gray-700 leading-relaxed">{chapter.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dreams Gallery Section */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="font-script text-5xl text-center text-purple-600 mb-16">My Dreams About Us</h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1743964451771-abf993f87b66" 
                  alt="Cartoon couple illustration"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">I Dream of Our First Meeting</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1747184046952-8890127c598a" 
                  alt="Cute cartoon animals"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">Walking Together Hand in Hand</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8 inline-block">
                <p className="text-lg text-gray-700 italic mb-4">
                  "Main tumhare saath ek khubsurat zindagi ka khwab dekhta hun"
                </p>
                <p className="text-sm text-gray-500">
                  (I dream of a beautiful life with you)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confession Section */}
      <section id="confession" className="py-20 bg-gradient-to-br from-purple-100 to-pink-200 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-script text-6xl text-purple-700 mb-12">From Barzan's Heart</h2>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 md:p-12 mb-12">
              <div className="mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1649297315673-873057ccc137" 
                  alt="Cartoon couple with hearts"
                  className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg animate-pulse-slow"
                />
              </div>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{proposalData.message}"
              </p>
              
              <h3 className="font-script text-4xl md:text-5xl text-purple-600 mb-8">
                Maryam, Will You Give Me A Chance?
              </h3>
              
              {!responseSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => handleProposalResponse('yes')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                             text-white px-12 py-4 rounded-full text-xl font-bold transform hover:scale-105 
                             transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                             min-w-[200px]"
                  >
                    {isLoading ? '💖' : 'Yes, I want to know you! 💝'}
                  </button>
                  
                  <button
                    onClick={() => handleProposalResponse('no')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600
                             text-white px-12 py-4 rounded-full text-xl font-bold transform hover:scale-105 
                             transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                             min-w-[200px]"
                  >
                    {isLoading ? '💭' : 'I need some time 💭'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">💖</div>
                  <p className="text-2xl text-purple-600 font-medium">
                    Your response means everything to me!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Section (shown after YES) */}
      {responseSubmitted && currentScreen === 'celebration' && (
        <section id="celebration" className="py-20 bg-gradient-to-br from-yellow-100 to-orange-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-script text-6xl text-orange-600 mb-8">🎉 She Said YES! 🎉</h2>
              <div className="mb-8">
                <img 
                  src="https://images.pexels.com/photos/7083127/pexels-photo-7083127.jpeg" 
                  alt="Happy cartoon couple"
                  className="w-32 h-32 mx-auto rounded-full animate-bounce"
                />
              </div>
              <div className="text-8xl mb-8">💝✨🎊</div>
              <p className="text-2xl text-orange-700 mb-8">
                The beginning of our beautiful story starts now, Maryam!
              </p>
              <div className="bg-white/90 rounded-lg shadow-xl p-8">
                <p className="text-lg text-gray-700 italic mb-4">
                  "Shukriya Maryam, tumne mujhe sabse khush kar diya!"
                </p>
                <p className="text-sm text-gray-500">
                  (Thank you Maryam, you've made me the happiest!)
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Understanding Section (shown after "need time") */}
      {responseSubmitted && currentScreen === 'understanding' && (
        <section id="understanding" className="py-20 bg-gradient-to-br from-blue-100 to-purple-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-script text-5xl text-blue-600 mb-8">I Understand, Maryam 💙</h2>
              <div className="mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1747184046952-8890127c598a" 
                  alt="Understanding cartoon"
                  className="w-32 h-32 mx-auto rounded-full animate-pulse-slow"
                />
              </div>
              <div className="text-6xl mb-8">🤗💭</div>
              <div className="bg-white/90 rounded-lg shadow-xl p-8">
                <p className="text-xl text-gray-700 mb-6">
                  Take all the time you need, Maryam.
                </p>
                <p className="text-lg text-gray-600 italic mb-4">
                  "Main intezaar karunga, kyunki sachi mohabbat sabr maang ti hai"
                </p>
                <p className="text-sm text-gray-500">
                  (I will wait, because true love requires patience)
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Made with 💖 by Barzan for Maryam</p>
          <p className="text-sm mt-2 opacity-75">Secret Love Confession • 2024</p>
        </div>
      </footer>
    </div>
  );
}

export default App;