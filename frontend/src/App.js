import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentSection, setCurrentSection] = useState('hero');
  const [proposalData, setProposalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proposalId, setProposalId] = useState(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);

  // Sample data for the proposal
  const sampleProposal = {
    partner_name: "My Love",
    proposer_name: "Your Name",
    message: "From the moment I met you, my world became brighter. Every day with you feels like a beautiful dream. You are my best friend, my soulmate, and my everything. I can't imagine spending my life with anyone else.",
    our_story: [
      {
        date: "First Meeting",
        description: "The day our eyes first met and my heart skipped a beat"
      },
      {
        date: "First Date",
        description: "Coffee that turned into hours of conversation and laughter"
      },
      {
        date: "First 'I Love You'",
        description: "The moment we knew this was forever"
      },
      {
        date: "Moving In Together",
        description: "Making our house a home filled with love and dreams"
      }
    ]
  };

  useEffect(() => {
    setProposalData(sampleProposal);
  }, []);

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
        message: response === 'yes' ? 'Yes! A thousand times yes!' : 'I need more time to think about this.'
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
        setCurrentSection(response === 'yes' ? 'celebration' : 'understanding');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (section) => {
    setCurrentSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!proposalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600 text-lg">Loading your love story...</p>
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
                currentSection === 'hero' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('story')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentSection === 'story' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Our Story
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentSection === 'gallery' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Memories
            </button>
            <button
              onClick={() => scrollToSection('proposal')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentSection === 'proposal' 
                  ? 'bg-rose-500 text-white' 
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              The Question
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1640744537094-0d5b8da84b01")',
            filter: 'brightness(0.7)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/50 to-pink-900/50"></div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1 className="font-script text-6xl md:text-8xl mb-8 animate-fade-in-up">
            {proposalData.proposer_name}
            <span className="block text-4xl md:text-6xl mt-4">♥</span>
            {proposalData.partner_name}
          </h1>
          <p className="text-xl md:text-2xl mb-12 animate-fade-in-up animation-delay-500 leading-relaxed">
            A Love Story Written in the Stars
          </p>
          <button
            onClick={() => scrollToSection('story')}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 
                     text-white px-8 py-4 rounded-full text-lg font-medium transform hover:scale-105 
                     transition-all duration-300 shadow-lg animate-fade-in-up animation-delay-1000"
          >
            Begin Our Journey 💕
          </button>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-script text-5xl text-center text-rose-600 mb-16">Our Beautiful Story</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {proposalData.our_story.map((chapter, index) => (
                <div key={index} className="flex items-center space-x-8 animate-slide-in-left">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full 
                                  flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-rose-700 mb-2">{chapter.date}</h3>
                    <p className="text-gray-700 leading-relaxed">{chapter.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="font-script text-5xl text-center text-rose-600 mb-16">Our Precious Memories</h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1699726252091-8b1f0d621d00" 
                  alt="Romantic moment"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">Our First Trip</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1699726265399-b20b23853611" 
                  alt="Special moment"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">A Perfect Day</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1620455970942-5fca5840d5ee" 
                  alt="Together"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">Forever Together</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1606800052052-a08af7148866" 
                  alt="Wedding rings"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <p className="text-gray-600 italic">Every picture tells our story of love...</p>
                <img 
                  src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8" 
                  alt="Romantic roses"
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proposal Section */}
      <section id="proposal" className="py-20 bg-gradient-to-br from-rose-100 to-pink-200 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1707248592051-4be0ecc8c204")'
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-script text-6xl text-rose-700 mb-12">The Question</h2>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 md:p-12 mb-12">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{proposalData.message}"
              </p>
              
              <div className="mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1553915632-175f60dd8e36" 
                  alt="Wedding rings"
                  className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg"
                />
              </div>
              
              <h3 className="font-script text-4xl md:text-5xl text-rose-600 mb-8">
                Will You Marry Me?
              </h3>
              
              {!responseSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => handleProposalResponse('yes')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                             text-white px-12 py-4 rounded-full text-xl font-bold transform hover:scale-105 
                             transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                             min-w-[160px]"
                  >
                    {isLoading ? '💖' : 'YES! 💍'}
                  </button>
                  
                  <button
                    onClick={() => handleProposalResponse('no')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600
                             text-white px-12 py-4 rounded-full text-xl font-bold transform hover:scale-105 
                             transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                             min-w-[160px]"
                  >
                    {isLoading ? '💭' : 'I need time 💭'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">💖</div>
                  <p className="text-2xl text-rose-600 font-medium">
                    Response submitted with love!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Section (shown after YES) */}
      {responseSubmitted && currentSection === 'celebration' && (
        <section id="celebration" className="py-20 bg-gradient-to-br from-yellow-100 to-orange-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-script text-6xl text-orange-600 mb-8">🎉 She Said YES! 🎉</h2>
              <div className="text-8xl mb-8">💍💖✨</div>
              <p className="text-2xl text-orange-700 mb-8">
                The beginning of our forever starts now!
              </p>
              <div className="bg-white/90 rounded-lg shadow-xl p-8">
                <p className="text-lg text-gray-700 italic">
                  "And they lived happily ever after... 💕"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Understanding Section (shown after "need time") */}
      {responseSubmitted && currentSection === 'understanding' && (
        <section id="understanding" className="py-20 bg-gradient-to-br from-blue-100 to-purple-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-script text-5xl text-blue-600 mb-8">I Understand 💙</h2>
              <div className="text-6xl mb-8">🤗💭</div>
              <div className="bg-white/90 rounded-lg shadow-xl p-8">
                <p className="text-xl text-gray-700 mb-6">
                  Take all the time you need, my love.
                </p>
                <p className="text-lg text-gray-600 italic">
                  "True love is patient, and I'll wait for you... 💕"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-rose-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Made with 💖 for love that lasts forever</p>
          <p className="text-sm mt-2 opacity-75">Love Proposal Template • 2024</p>
        </div>
      </footer>
    </div>
  );
}

export default App;