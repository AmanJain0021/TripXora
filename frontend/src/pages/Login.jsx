import React from 'react';
import LoginForm from '../features/auth/LoginForm';
import signupBg from '../assets/signup-bg.jpeg';

const Login = () => {
   return (
      <div className="h-screen w-full relative overflow-hidden font-sans flex">

         {/* 1. Full-screen User Provided Background Image */}
         <div className="absolute inset-0 z-0">
            <img src="/login-bg.jpg" alt="Login Background" className="w-full h-full object-cover object-center" />

            {/* Subtle gradient overlay on the left to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent lg:w-[60%]"></div>
         </div>

         {/* 2. Decorative Airplane Dashed Line */}
         <div className="absolute top-[35%] left-[8%] w-[35%] h-64 border-t-[2.5px] border-dashed border-purple-400/80 rounded-[100%] opacity-90 -rotate-[15deg] pointer-events-none z-10">
            <svg className="absolute -top-4 -right-1 w-8 h-8 text-purple-600 rotate-[75deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
         </div>

         {/* LEFT PANEL CONTENT */}
         <div className="w-full lg:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative z-20 pt-4 pb-20">
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-10">
                  <img src="/logo.png" alt="TripXora Logo" className="h-12 w-auto object-contain drop-shadow-sm" />
                  <div className="flex flex-col mt-1">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">AI-Powered Travel Planner</span>
                  </div>
               </div>

               <h1 className="text-5xl lg:text-[64px] font-extrabold text-[#111827] tracking-tight leading-[1.05] mb-5">
                  Plan <span className="text-[#2563eb]">Smarter,</span><br />Travel <span className="text-[#4338ca]">Better</span>
               </h1>
               <p className="text-[17px] text-gray-800 font-semibold max-w-[340px] leading-relaxed">
                  AI-powered itineraries, smart budgets and unforgettable experiences.
               </p>
            </div>

            {/* Feature Container - Large Glass Box */}
            <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] p-8 pr-12 border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-20 inline-block mt-4 w-max">
               <div className="grid grid-cols-2 gap-x-12 gap-y-8">

                  {/* Feature 1 */}
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                     </div>
                     <h4 className="font-extrabold text-[14px] text-[#1e293b] leading-tight">Smart<br />Itineraries</h4>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <h4 className="font-extrabold text-[14px] text-[#1e293b] leading-tight">Budget<br />Optimization</h4>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     </div>
                     <h4 className="font-extrabold text-[14px] text-[#1e293b] leading-tight">Curated<br />Destinations</h4>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)] shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                     </div>
                     <h4 className="font-extrabold text-[14px] text-[#1e293b] leading-tight">Real-time<br />Suggestions</h4>
                  </div>

               </div>
            </div>
         </div>

         {/* Centered Login Form floating over the background */}
         <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[24%] z-30 pb-16">
            <div className="pointer-events-auto w-full max-w-[420px] px-4">
               <LoginForm />
            </div>
         </div>

         {/* BOTTOM INFO BAR (Transparent, directly on background) */}
         <div className="absolute bottom-6 left-0 right-0 z-40 hidden md:flex items-center justify-center gap-14 px-10">

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7c3aed] shadow-[0_4px_10px_rgba(0,0,0,0.08)] shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.642 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.358-.166-2.001A11.954 11.954 0 0110 1.944zM11.25 11.5a1.25 1.25 0 10-2.5 0v.5a.25.25 0 00.25.25h2a.25.25 0 00.25-.25v-.5zM10 7a1 1 0 00-1 1v1a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
               </div>
               <div>
                  <p className="font-extrabold text-[13px] text-[#1e293b] leading-tight">Secure & Private</p>
                  <p className="text-[11px] text-gray-600 font-semibold mt-0.5">Your data is safe with us</p>
               </div>
            </div>

            <div className="w-px h-8 bg-gray-400/40"></div>

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3b82f6] shadow-[0_4px_10px_rgba(0,0,0,0.08)] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
               </div>
               <div>
                  <p className="font-extrabold text-[13px] text-[#1e293b] leading-tight">Fast & Easy</p>
                  <p className="text-[11px] text-gray-600 font-semibold mt-0.5">Plan in just a few clicks</p>
               </div>
            </div>

            <div className="w-px h-8 bg-gray-400/40"></div>

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#10b981] shadow-[0_4px_10px_rgba(0,0,0,0.08)] shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path></svg>
               </div>
               <div>
                  <p className="font-extrabold text-[13px] text-[#1e293b] leading-tight">Trusted by Travelers</p>
                  <p className="text-[11px] text-gray-600 font-semibold mt-0.5">Join thousands of happy explorers</p>
               </div>
            </div>

            <div className="w-px h-8 bg-gray-400/40"></div>

            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#f97316] shadow-[0_4px_10px_rgba(0,0,0,0.08)] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
               </div>
               <div>
                  <p className="font-extrabold text-[13px] text-[#1e293b] leading-tight">24/7 Support</p>
                  <p className="text-[11px] text-gray-600 font-semibold mt-0.5">We're here to help you</p>
               </div>
            </div>

         </div>

      </div>
   );
};

export default Login;
