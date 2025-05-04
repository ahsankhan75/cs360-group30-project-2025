import { Link } from "react-router-dom";
import StarRating from "../components/Reviews/StarRating";

const HospitalList = ({ hospitals }) => {
  return (
    <div className="mt-4">
      {hospitals.length === 0 ? (
        <p className="text-center text-gray-500">No hospitals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div
              key={hospital._id}
              className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow min-h-[350px] h-auto flex flex-col"
            >
              <div className="flex-grow overflow-hidden">
                <h3 className="text-lg font-bold text-teal-700 line-clamp-1">
                  {hospital.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {hospital.location.address}
                </p>

                {/* Rating display with review count */}
                <div className="flex flex-wrap items-center mb-3">
                  {hospital.ratings ? (
                    <>
                      <div className="flex items-center">
                        <StarRating rating={hospital.ratings || 0} />
                        <span className="ml-2 text-sm text-gray-600">
                          {hospital.ratings.toFixed(1)}
                        </span>
                      </div>
                      <span className="ml-1 text-sm text-gray-500">
                        ({hospital.reviewCount || 0}{" "}
                        {hospital.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                  )}
                </div>

                {hospital.wait_times?.general &&
                  (() => {
                    const wait = parseInt(hospital.wait_times.general);
                    let textColor = "text-green-700";
                    let bgColor = "bg-green-100";

                    if (wait > 40) {
                      textColor = "text-red-700";
                      bgColor = "bg-red-100";
                    } else if (wait > 25) {
                      textColor = "text-yellow-700";
                      bgColor = "bg-yellow-100";
                    }

                    return (
                      <div
                        className={`inline-block px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium ${textColor} ${bgColor} mb-1`}
                      >
                        Wait Time (General): {hospital.wait_times.general}
                      </div>
                    );
                  })()}

                {hospital.wait_times?.emergency &&
                  (() => {
                    const wait = parseInt(hospital.wait_times.emergency);
                    let textColor = "text-green-700";
                    let bgColor = "bg-green-100";

                    if (wait > 30) {
                      textColor = "text-red-700";
                      bgColor = "bg-red-100";
                    } else if (wait > 15) {
                      textColor = "text-yellow-700";
                      bgColor = "bg-yellow-100";
                    }

                    return (
                      <div
                        className={`inline-block px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium ${textColor} ${bgColor} ml-1`}
                      >
                        Wait (Emergency): {hospital.wait_times.emergency}
                      </div>
                    );
                  })()}

                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p className="text-xs sm:text-sm line-clamp-1">
                      <strong>ICU Beds:</strong> {hospital.resources.icu_beds}
                    </p>
                    <p className="text-xs sm:text-sm line-clamp-1">
                      <strong>Ventilators:</strong> {hospital.resources.ventilators}
                    </p>
                    <p className="text-xs sm:text-sm line-clamp-1 col-span-2">
                      <strong>Blood Bank:</strong>{" "}
                      <span
                        className={
                          hospital.resources.blood_bank
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {hospital.resources.blood_bank
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm line-clamp-1 mt-1">
                    <strong>Medical Imaging:</strong>{" "}
                    {hospital.resources.medical_imaging?.length
                      ? hospital.resources.medical_imaging.join(", ")
                      : "None available"}
                  </p>
                </div>

                {hospital.services && hospital.services.length > 0 && (
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <p className="text-xs sm:text-sm">
                      <strong>Specializations:</strong>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                        >
                          {service}
                        </span>
                      ))}
                      {hospital.services.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{hospital.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {hospital.insurance_accepted &&
                  hospital.insurance_accepted.length > 0 && (
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <p className="text-xs sm:text-sm line-clamp-1">
                        <strong>Insurance:</strong>{" "}
                        {hospital.insurance_accepted.length} providers accepted
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-200">
                <Link
                  to={`/reviews?hospital=${hospital._id}`}
                  className="text-teal-600 hover:text-teal-800 flex items-center text-xs sm:text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Reviews
                </Link>
                <Link
                  to={`/hospital/${hospital._id}`}
                  className="px-2 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors text-xs sm:text-sm"
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
