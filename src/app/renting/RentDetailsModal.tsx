"use client";

export type RentalData = {
    id: number;
    username: string;
    startTime: Date;
    endTime: Date | null;
    bicycleId: string | number;
    status: 'active' | 'completed';
    returnPicture?: string;
    note?: string;
}

type Props = {
    show: boolean;
    rental: RentalData | null;
    onClose: () => void;
    formatTime: (date: Date) => string;
    formatDate: (date: Date) => string;
    calculateFinalPrice: (rental: RentalData) => string;
    getBicycleTitle: (bicycleId: string | number) => React.ReactNode;
    onEditBicycle: (bicycleId: string | number) => void;
};

const getUserInfo = (username: string) => {
    const users = localStorage.getItem("users");
    if (users) {
        const parsedUsers = JSON.parse(users);
        const user = parsedUsers.find((u: any) => u.username === username);
        return user || null;
    }
    return null;
};

export default function RentDetailsModal({ 
    show, 
    rental, 
    onClose,
    formatTime,
    formatDate,
    calculateFinalPrice,
    getBicycleTitle,
    onEditBicycle
}: Props) {
    if (!show || !rental) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Return State - {getBicycleTitle(rental.bicycleId)}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6">
                                <h6 className="text-muted mb-3">Rental Information</h6>
                                <div className="mb-2">
                                    <strong>Username:</strong> {rental.username}
                                </div>
                                <div className="mb-2">
                                    <strong>Name:</strong> {getUserInfo(rental.username)?.name + ' ' + getUserInfo(rental.username)?.surname || 'Unknown'}
                                </div>
                                <div className="mb-2">
                                    <strong>Email:</strong> {getUserInfo(rental.username)?.email || 'Unknown'}
                                </div>
                                <div className="mb-2">
                                    <strong>Phone:</strong> {getUserInfo(rental.username)?.phone || 'Unknown'}
                                </div>
                                <div className="mb-2">
                                    <strong>Start Time:</strong> {formatTime(rental.startTime)} - {formatDate(rental.startTime)}
                                </div>
                                <div className="mb-2">
                                    <strong>End Time:</strong> {rental.endTime ? `${formatTime(rental.endTime)} - ${formatDate(rental.endTime)}` : 'N/A'}
                                </div>
                                <div className="mb-2">
                                    <strong>Final Price:</strong> <span className="text-success">€{calculateFinalPrice(rental)}</span>
                                </div>
                                {rental.note && (
                                    <div className="mt-4">
                                        <h6 className="text-muted mb-2">Note:</h6>
                                        <div className="alert alert-info">
                                            {rental.note}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-3">Return Picture</h6>
                                {rental.returnPicture && (
                                    <img 
                                        src={rental.returnPicture} 
                                        alt="Returned bicycle" 
                                        className="img-fluid rounded border"
                                        style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                                    />
                                )}
                                <button 
                                    type="button" 
                                    className="btn btn-primary btn-sm mt-3 w-100"
                                    onClick={() => onEditBicycle(rental.bicycleId)}
                                >
                                    <i className="bi bi-pencil"></i> Edit Bicycle Status
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
