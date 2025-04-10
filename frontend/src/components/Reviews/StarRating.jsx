import React from 'react';

const StarRating = ({ rating, size = 'md' }) => {
  // Convert rating to nearest half (e.g., 4.3 becomes 4.5, 4.1 becomes 4)
  const roundedRating = Math.round(rating * 2) / 2;
  
  // Define star size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };
  
  const renderStars = () => {
    const stars = [];
    
    // Add full stars
    for (let i = 1; i <= Math.floor(roundedRating); i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      );
    }
    
    // Add a half star if needed
    if (roundedRating % 1 !== 0) {
      stars.push(
        <span key="half" className="text-yellow-400 relative">
          <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>★</span>
          <span className="text-gray-300">★</span>
        </span>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(roundedRating);
    for (let i = 1; i <= emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }
    
    return stars;
  };
  
  return (
    <div className={`flex ${sizeClasses[size]}`} aria-label={`Rating: ${rating} out of 5 stars`}>
      {renderStars()}
    </div>
  );
};

export default StarRating;
