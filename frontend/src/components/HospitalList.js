import { Link } from 'react-router-dom';
import StarRating from '../components/Reviews/StarRating';

const HospitalList = ({ hospitals }) => {
  return (
    <div className="mt-4">
      {hospitals.length === 0 ? (
        <p className="text-center text-gray-500">No hospitals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-teal-700">{hospital.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{hospital.location.address}</p>

              {/* Rating display with review count */}
              <div className="flex items-center mb-3">
                {hospital.ratings ? (
                  <>
                    <StarRating rating={hospital.ratings || 0} />
                    <span className="ml-2 text-sm text-gray-600">
                      {hospital.ratings.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({hospital.reviewCount || 0} {hospital.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No ratings yet</span>
                )}
              </div>

              <div className="border-t border-gray-200 my-2 pt-2">
                <p><strong>ICU Beds:</strong> {hospital.resources.icu_beds}</p>
                <p><strong>Ventilators:</strong> {hospital.resources.ventilators}</p>
                <p><strong>Blood Bank:</strong> <span className={hospital.resources.blood_bank ? "text-green-600" : "text-gray-500"}>{hospital.resources.blood_bank ? "Available" : "Not Available"}</span></p>
                <p><strong>Medical Imaging:</strong> {hospital.resources.medical_imaging?.length ? hospital.resources.medical_imaging.join(", ") : "None available"}</p>
              </div>

              {hospital.services && hospital.services.length > 0 && (
                <div className="border-t border-gray-200 my-2 pt-2">
                  <p><strong>Specializations:</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hospital.services.slice(0, 3).map((service, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {service}
                      </span>
                    ))}
                    {hospital.services.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{hospital.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                <div className="border-t border-gray-200 my-2 pt-2">
                  <p><strong>Insurance:</strong> {hospital.insurance_accepted.length} providers accepted</p>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <Link
                  to={`/reviews?hospital=${hospital._id}`}
                  className="text-teal-600 hover:text-teal-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Reviews & Ratings
                </Link>
                <Link
                  to={`/hospital/${hospital._id}`}
                  className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors text-sm"
                >
                  More Info
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalList;