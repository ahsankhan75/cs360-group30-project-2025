// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import ProfileIcon from '../components/profile-icon';
// import StarRating from '../components/Reviews/StarRating';
// import ReviewList from '../components/Reviews/ReviewList';
// import HospitalReviewForm from '../components/Reviews/HospitalReviewForm';
// import { useAuthContext } from '../hooks/useAuthContext';

// const HospitalDetail = () => {
//   const { id } = useParams();
//   const [hospital, setHospital] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const { user } = useAuthContext();

//   useEffect(() => {
//     const fetchHospital = async () => {
//       try {
//         const response = await fetch(`/api/hospitals/${id}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch hospital data');
//         }

//         const data = await response.json();
//         setHospital(data);

//         // Fetch reviews after getting hospital data
//         fetchReviews(data._id);
//       } catch (err) {
//         console.error('Error:', err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     const fetchReviews = async (hospitalId) => {
//       try {
//         const response = await fetch(`/api/reviews/hospital/${hospitalId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch reviews');
//         }

//         const reviewsData = await response.json();
//         setReviews(reviewsData);
//       } catch (err) {
//         console.error('Error fetching reviews:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHospital();
//   }, [id]);

//   const handleReviewSubmitted = (newReview) => {
//     setReviews(prevReviews => [newReview, ...prevReviews]);
//     setShowReviewForm(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 max-w-screen-xl mx-auto">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <p>Error: {error}</p>
//           <Link to="/" className="text-teal-600 hover:underline">Return to Home</Link>
//         </div>
//       </div>
//     );
//   }

//   if (!hospital) {
//     return <div>No hospital data found.</div>;
//   }

//   return (
//     <div className="p-6 min-h-screen bg-gray-100">

//       <div className="max-w-screen-xl mx-auto">
//         <nav className="flex mb-6" aria-label="Breadcrumb">
//           <ol className="inline-flex items-center space-x-1 md:space-x-3">
//             <li className="inline-flex items-center">
//               <Link to="/" className="text-gray-600 hover:text-teal-600">Home</Link>
//             </li>
//             <li className="inline-flex items-center">
//               <span className="mx-2 text-gray-400">/</span>
//               <Link to="/hospitals" className="text-gray-600 hover:text-teal-600">Hospitals</Link>
//             </li>
//             <li aria-current="page">
//               <span className="mx-2 text-gray-400">/</span>
//               <span className="text-gray-500">{hospital.name}</span>
//             </li>
//           </ol>
//         </nav>

//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <div className="flex flex-col md:flex-row justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-teal-600 mb-2">{hospital.name}</h1>
//               <p className="text-gray-700 mb-4">{hospital.location?.address}</p>

//               <div className="flex items-center mb-6">
//                 {hospital.ratings ? (
//                   <>
//                     <StarRating rating={hospital.ratings || 0} size="lg" />
//                     <span className="ml-2 font-medium">
//                       {hospital.ratings.toFixed(1)}
//                     </span>
//                     <span className="mx-1 text-gray-500">•</span>
//                     <span className="text-gray-600">
//                       {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
//                     </span>
//                   </>
//                 ) : (
//                   <span className="text-gray-500">No ratings yet</span>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 md:mt-0">
//               {user ? (
//                 <button
//                   onClick={() => setShowReviewForm(!showReviewForm)}
//                   className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
//                 >
//                   {showReviewForm ? 'Cancel Review' : 'Write a Review'}
//                 </button>
//               ) : (
//                 <Link
//                   to="/login"
//                   className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
//                 >
//                   Login to Write Review
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div className="md:col-span-2">
//             {showReviewForm && (
//               <HospitalReviewForm
//                 hospitalId={hospital._id}
//                 hospitalName={hospital.name}
//                 onReviewSubmitted={handleReviewSubmitted}
//               />
//             )}

//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="font-medium text-teal-600">Resources</h3>
//                   <ul className="mt-2 space-y-1">
//                     <li><strong>ICU Beds:</strong> {hospital.resources?.icu_beds || 'N/A'}</li>
//                     <li><strong>Ventilators:</strong> {hospital.resources?.ventilators || 'N/A'}</li>
//                     <li><strong>Blood Bank:</strong> {hospital.resources?.blood_bank ? "Available" : "Not Available"}</li>
//                     <li><strong>Emergency Capacity:</strong> {hospital.resources?.emergency_capacity || 'N/A'}</li>
//                   </ul>
//                 </div>

//                 {hospital.services && hospital.services.length > 0 && (
//                   <div>
//                     <h3 className="font-medium text-teal-600">Specializations</h3>
//                     <div className="mt-2 flex flex-wrap gap-1">
//                       {hospital.services.map((service, index) => (
//                         <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
//                           {service}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
//                   <div>
//                     <h3 className="font-medium text-teal-600 mt-4">Insurance Accepted</h3>
//                     <div className="mt-2 flex flex-wrap gap-1">
//                       {hospital.insurance_accepted.map((insurance, index) => (
//                         <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                           {insurance}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <h3 className="font-medium text-teal-600">Medical Imaging</h3>
//                   <ul className="mt-2">
//                     {hospital.resources?.medical_imaging?.map(item => (
//                       <li key={item} className="inline-block bg-gray-100 px-2 py-1 rounded text-sm mr-2 mb-2">
//                         {item}
//                       </li>
//                     ))}
//                     {(!hospital.resources?.medical_imaging || hospital.resources.medical_imaging.length === 0) && (
//                       <li>No information available</li>
//                     )}
//                   </ul>
//                 </div>
//               </div>

//               {hospital.contact && (
//                 <div className="mt-6">
//                   <h3 className="font-medium text-teal-600">Contact Information</h3>
//                   <p className="mt-1"><strong>Phone:</strong> {hospital.contact.phone || 'N/A'}</p>
//                   <p><strong>Email:</strong> {hospital.contact.email || 'N/A'}</p>
//                   <p><strong>Website:</strong> {hospital.contact.website ?
//                     <a href={hospital.contact.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
//                       {hospital.contact.website}
//                     </a> : 'N/A'}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="bg-white rounded-lg shadow-md p-6 mt-8">
//               <ReviewList reviews={reviews} loading={false} />
//             </div>
//           </div>

//           <div className="md:col-span-1">
//             <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
//               <h3 className="font-medium text-teal-600 mb-4">Location</h3>

//               {hospital.location?.coordinates && (
//                 <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
//                   <div className="text-center text-gray-600">
//                     <p>Map View</p>
//                     <p className="text-xs mt-1">
//                       Lat: {hospital.location.coordinates[1]?.toFixed(6)}<br />
//                       Long: {hospital.location.coordinates[0]?.toFixed(6)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div className="mt-4">
//                 <h4 className="font-medium">Address:</h4>
//                 <p className="text-gray-700">{hospital.location?.address}</p>
//               </div>

//               <Link
//                 to={`/blood-requests?hospital=${hospital._id}`}
//                 className="block w-full text-center mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//               >
//                 View Blood Donation Requests
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HospitalDetail;


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';
import ReviewList from '../components/Reviews/ReviewList';
import HospitalReviewForm from '../components/Reviews/HospitalReviewForm';
import { useAuthContext } from '../hooks/useAuthContext';

const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await fetch(`/api/hospitals/${id}`);
        if (!response.ok) throw new Error('Failed to fetch hospital data');

        const data = await response.json();
        setHospital(data);
        fetchReviews(data._id);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchReviews = async (hospitalId) => {
      try {
        const response = await fetch(`/api/reviews/hospital/${hospitalId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');

        const reviewsData = await response.json();
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <Link to="/" className="text-teal-600 hover:underline">Return to Home</Link>
      </div>
    </div>
  );

  if (!hospital) return <div>No hospital data found.</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-600 hover:text-teal-600">Home</Link>
            </li>
            <li className="inline-flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/hospitals" className="text-gray-600 hover:text-teal-600">Hospitals</Link>
            </li>
            <li aria-current="page">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{hospital.name}</span>
            </li>
          </ol>
        </nav>

        {/* Hospital Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-600 mb-2">{hospital.name}</h1>
              <p className="text-gray-700 mb-4">{hospital.location?.address}</p>
              <div className="flex items-center mb-6">
                {hospital.ratings ? (
                  <>
                    <StarRating rating={hospital.ratings} size="lg" />
                    <span className="ml-2 font-medium">{hospital.ratings.toFixed(1)}</span>
                    <span className="mx-1 text-gray-500">•</span>
                    <span className="text-gray-600">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">No ratings yet</span>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {user ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                >{showReviewForm ? 'Cancel Review' : 'Write a Review'}</button>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors">Login to Write Review</Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {showReviewForm && (
              <HospitalReviewForm
                hospitalId={hospital._id}
                hospitalName={hospital.name}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resources */}
                <div>
                  <h3 className="font-medium text-teal-600">Resources</h3>
                  <ul className="mt-2 space-y-1">
                    <li><strong>ICU Beds:</strong> {hospital.resources?.icu_beds || 'N/A'}</li>
                    <li><strong>Ventilators:</strong> {hospital.resources?.ventilators || 'N/A'}</li>
                    <li><strong>Blood Bank:</strong> {hospital.resources?.blood_bank ? 'Available' : 'Not Available'}</li>
                    <li><strong>Emergency Capacity:</strong> {hospital.resources?.emergency_capacity || 'N/A'}</li>
                  </ul>
                </div>
                {/* Specializations */}
                {hospital.services?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-teal-600">Specializations</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {hospital.services.map((service, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">{service}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Insurance Accepted */}
                {hospital.insurance_accepted?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-teal-600 mt-4">Insurance Accepted</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {hospital.insurance_accepted.map((ins, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{ins}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Medical Imaging */}
                <div>
                  <h3 className="font-medium text-teal-600">Medical Imaging</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {hospital.resources?.medical_imaging?.map((item, i) => (
                      <li key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{item}</li>
                    )) || <li>No information available</li>}
                  </ul>
                </div>
                {/* Contact Info */}
                {hospital.contact && (
                  <div className="sm:col-span-2">
                    <h3 className="font-medium text-teal-600 mt-4">Contact Information</h3>
                    <p className="mt-1"><strong>Phone:</strong> {hospital.contact.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {hospital.contact.email || 'N/A'}</p>
                    <p><strong>Website:</strong> {hospital.contact.website ? <a href={hospital.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{hospital.contact.website}</a> : 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <ReviewList reviews={reviews} loading={false} />
            </div>
          </div>
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="font-medium text-teal-600 mb-4">Location</h3>
              {hospital.location?.coordinates && (
                <div className="aspect-square w-full rounded overflow-hidden">
                  <iframe
                    title="Hospital Location"
                    src={`https://www.google.com/maps?q=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}&z=15&output=embed`}
                    className="w-full h-full border-0"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-medium">Address:</h4>
                <p className="text-gray-700">{hospital.location?.address}</p>
              </div>
              <Link to={`/blood-requests?hospital=${hospital._id}`} className="block w-full text-center mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">View Blood Donation Requests</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetail;
