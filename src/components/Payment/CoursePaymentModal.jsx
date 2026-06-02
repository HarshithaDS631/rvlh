import { useState } from 'react';
import { CreditCard, Shield, Lock, X, CheckCircle } from 'lucide-react';
import './CoursePaymentModal.css';

export default function CoursePaymentModal({ course, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const price = 499; // Standard course unlock price for this demo
  const gst = Math.round(price * 0.18);
  const total = price + gst;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(course);
      }, 1500);
    }, 1500);
  };

  if (!course) return null;

  return (
    <div className="course-payment-overlay animate-fadeIn" onClick={onClose}>
      <div className="course-payment-modal animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button className="cpm-close-btn" onClick={onClose}><X size={20} /></button>
        
        {isSuccess ? (
          <div className="cpm-success-state animate-scaleIn">
            <CheckCircle size={48} color="var(--success)" />
            <h2>Payment Successful!</h2>
            <p>You have unlocked <strong>{course.name}</strong>.</p>
          </div>
        ) : (
          <>
            <div className="cpm-header">
              <h2><CreditCard size={20} /> Unlock Course</h2>
              <p className="cpm-subtitle">
                Purchasing <strong>{course.name}</strong>
              </p>
            </div>
            
            <div className="cpm-methods">
              <button 
                type="button"
                className={`cpm-method-btn ${paymentMethod === 'credit' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit')}
              >
                Credit Card
              </button>
              <button 
                type="button"
                className={`cpm-method-btn ${paymentMethod === 'debit' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('debit')}
              >
                Debit Card
              </button>
              <button 
                type="button"
                className={`cpm-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI
              </button>
              <button 
                type="button"
                className={`cpm-method-btn ${paymentMethod === 'emi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('emi')}
              >
                EMI
              </button>
            </div>
            
            <form className="cpm-form" onSubmit={handlePay}>
              {paymentMethod === 'upi' ? (
                <div className="form-group">
                  <label className="form-label">UPI ID / VPA</label>
                  <input type="text" className="form-input" placeholder="e.g. yourname@upi" required />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Name on {paymentMethod === 'debit' ? 'Debit' : 'Credit'} Card</label>
                    <input type="text" className="form-input" placeholder="Enter cardholder name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{paymentMethod === 'debit' ? 'Debit' : 'Credit'} Card Number</label>
                    <input type="text" className="form-input" placeholder="1234 5678 9012 3456" required minLength={16} />
                  </div>
                  <div className="cpm-row">
                    <div className="form-group">
                      <label className="form-label">Expiry</label>
                      <input type="text" className="form-input" placeholder="MM/YY" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input type="password" className="form-input" placeholder="123" required minLength={3} />
                    </div>
                  </div>
                  {paymentMethod === 'emi' && (
                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label className="form-label">EMI Tenure</label>
                      <select className="form-select" required>
                        <option value="">Select EMI Plan</option>
                        <option value="3">3 Months (₹{Math.round(total/3)}/mo)</option>
                        <option value="6">6 Months (₹{Math.round(total/6)}/mo)</option>
                        <option value="9">9 Months (₹{Math.round(total/9)}/mo)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="cpm-summary">
                <div className="cpm-line">
                  <span>{course.name}</span>
                  <span>₹{price}</span>
                </div>
                <div className="cpm-line">
                  <span>GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="cpm-line cpm-total">
                  <span>Total Payable</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg cpm-pay-btn" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="spinner"></span>
                ) : (
                  <><Lock size={16} /> Pay ₹{total}</>
                )}
              </button>
              
              <div className="cpm-secure">
                <Shield size={14} />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
