import React from 'react';
import { currentUser } from '../data/mockData';

export const WelcomeSection: React.FC = () => {
  return (
    <section className="pt-2 pb-6">
      <p className="text-[15px] font-medium text-slate-500 leading-none mb-1.5">
        Welcome back,
      </p>
      <h2 className="text-[32px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
        {currentUser.name}
      </h2>
      <p className="text-[14px] font-medium text-slate-500 mt-1">
        Here's your work overview
      </p>
    </section>
  );
};

