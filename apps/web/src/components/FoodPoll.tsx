'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export default function FoodPoll() {
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    try {
      const res = await apiClient.get('/food/poll');
      setPoll(res.data);
    } catch (error) {
      console.error('Error fetching food poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string, mealType: string) => {
    setVoting(optionId);
    try {
      await apiClient.post('/food/vote', { optionId, mealType });
      await fetchPoll();
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setVoting(null);
    }
  };

  if (loading) return <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest p-4">Loading poll...</div>;
  if (!poll) return null;

  const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];

  // Helper to count votes for an option
  const getVoteCount = (optionId: string) => {
    return poll.results?.find((r: any) => r.optionId === optionId)?._count?._all || 0;
  };

  const getWinnerForMeal = (meal: string) => {
    const mealOptions = poll.options.filter((o: any) => o.mealType === meal);
    if (mealOptions.length === 0) return null;
    return mealOptions.reduce((leading: any, curr: any) => {
      const leadingVotes = getVoteCount(leading.id);
      const currVotes = getVoteCount(curr.id);
      return currVotes > leadingVotes ? curr : leading;
    }, mealOptions[0]);
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'BREAKFAST': return 'free_breakfast';
      case 'LUNCH': return 'soup_kitchen';
      default: return 'dinner_dining';
    }
  };

  const getMealImage = (meal: string) => {
    switch (meal) {
      case 'BREAKFAST': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlZVny4VQiM8Gz6ebjxYMDvS_WrqOBrPy7bXKAR9CmvZiUjBB_z5C-1hQ6bw2WTOadg8yDOrKbWMhb006W0H24xOzWS2Aho_OsSZcgMa-Iane1tmrNHq4BdwMCNSUtnliU2zwVMMxnPiTjXuVp1veHmDM7HNiB2BtLVCYz6CSJAF6Ts4v_5Gk0d7RQfW1V5V-k7pbOwnWc2-O_6ifqSETcgcXnEEVOnZpTLDhwpC-m1Md2HE_fvB9j3Q';
      case 'LUNCH': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsu1rsAoCexUjfboAKQmmVBTvW7zMHRDYDLCS8z7Mo9ckg6Rli8_h5lIXKtvQu8tNJQTNbIJGIqXvT8sZiFN29WP6bAn2YZVzYzyWqsPySYZ0MjgSwnudrIs-1ivLw6Kqkx7FcHqDCuH2sZ7Ci8YYpCjUFP5xhC7MACqnFC5IoePTZD8D2-4xE_Tvs4fH0QZ1w7n289raZOXYtKQ1nwumqKi3NfI6CZQPaMiSgGcq12zgk0WWJGBOoJA';
      default: return 'https://lh3.googleusercontent.com/aida-public/AB6AXuChInGjOXX1IgSgjhhmeJt5nhX2EAtm7WYb3zKDqpf9PAavs2lN46G7647kaTra-1sfwDV1Ds3Uufv5vRuegRvJbMGenszYz2dFIYZic6emx6GSu7cHikfdfNuJiNdJk-4dw3H06dYdtvYQOVgNbJo0gsjqyk271-TSNJveGjRvwbI510f80HADs2SWbS2-st9ZFJ-e_mPEOdXwvca6lo0a7Kma15Cmu0Mxyd46tm-qSOrvD2S2JU17GQ';
    }
  };

  const totalVotesCount = poll.results?.reduce((acc: number, curr: any) => acc + (curr._count?._all || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Daily Menu Polling</h3>
        <p className="text-xs text-outline font-medium">Select your choice for tomorrow's meals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {meals.map((meal) => {
          const options = poll.options.filter((o: any) => o.mealType === meal);
          const myVote = poll.myVotes.find((v: any) => v.mealType === meal);
          
          return (
            <div key={meal} className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex flex-col justify-between h-full hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">{getMealIcon(meal)}</span>
                    <h4 className="font-title-md text-sm font-bold text-on-surface uppercase tracking-wider">{meal}</h4>
                  </div>
                  {myVote && (
                    <span className="material-symbols-outlined text-success-emerald text-[18px]" title="Voted">check_circle</span>
                  )}
                </div>

                <div className="space-y-3">
                  {options.map((option: any) => {
                    const isSelected = myVote?.optionId === option.id;
                    const votes = getVoteCount(option.id);
                    const leadingWinner = getWinnerForMeal(meal);
                    const isLeading = leadingWinner?.id === option.id;
                    
                    return (
                      <div 
                        key={option.id}
                        onClick={() => !isSelected && handleVote(option.id, meal)}
                        className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/[0.03]' 
                            : 'border-surface-border bg-white hover:border-outline/30'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-xs text-on-surface leading-tight">{option.name}</span>
                          {isLeading && (
                            <span className="material-symbols-outlined text-amber-500 text-[16px]" title="Leading Choice">star</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-outline pt-1">
                          <span>Votes: <strong className="text-on-surface font-semibold">{votes}</strong></span>
                          {isSelected ? (
                            <span className="text-primary font-bold uppercase tracking-wider text-[9px]">Voted</span>
                          ) : (
                            <span className="text-outline uppercase tracking-wider text-[9px] hover:text-primary">Vote</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
