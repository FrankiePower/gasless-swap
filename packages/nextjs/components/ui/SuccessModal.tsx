import { useGlobal } from "../../contexts/Global";

export const SuccessModal = () => {
  const { setIsSuccess, isSuccess } = useGlobal();

  const handleClose = () => {
    setIsSuccess(false);
  };

  return (
    <>
      {/* Modal */}
      <input type="checkbox" id="success-modal" className="modal-toggle" checked={isSuccess} onChange={handleClose} />
      <div className="modal">
        <div className="modal-box bg-base-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Success!</h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center py-8">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-base-content">Swap Successful!</h3>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-base-content/70">Your gasless swap has been completed successfully.</p>
            </div>

            {/* Action Button */}
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleClose}>
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
