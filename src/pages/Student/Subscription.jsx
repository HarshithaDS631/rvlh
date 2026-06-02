import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Check, Crown, Sparkles, Shield, ArrowRight, CreditCard,
  Star, Zap, Lock
} from 'lucide-react';
import './Subscription.css';

const subscriptionPlans = [
  {
    id: 'pro',
    name: 'Pro Learner',
    price: 999,
    popular: true,
    color: '#3385ff',
    features: [
      'Unlimited Video Access',
      'AI Quizzes Unlocked',
      'Full Modules Access',
      'Study Material Downloads',
      'Performance Analytics'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Scholar',
    price: 1499,
    popular: false,
    color: '#a855f7',
    features: [
      'Everything in Pro',
      '1-on-1 Mentorship',
      'Doubt Clearing Sessions',
      'Custom Study Plans',
      'Mock Test Series'
    ]
  }
];

export default function Subscription() {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showPayment, setShowPayment] = useState(location.state?.showPayment || false);

  const isRVLH = user?.type === 'rvlh';

  if (isRVLH) {
    return (
      <div className="subscription-page">
        <div className="sub-free-access animate-fadeInUp">
          <div className="sub-free-icon">
            <Crown size={48} />
          </div>
          <h2>You Have Full Free Access! 🎉</h2>
          <p>As an RVLH student, you enjoy unlimited access to all videos, materials, and AI quizzes at no cost.</p>
          <div className="sub-free-features">
            {['Unlimited Videos', 'Unlimited AI Quizzes', 'All Study Materials', 'Performance Analytics', 'Subject-wise Learning'].map((f) => (
              <div key={f} className="sub-free-feature">
                <Check size={16} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Link to="/student" className="btn btn-primary btn-lg" id="back-to-dashboard">
            Back to Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="sub-header animate-fadeInUp">
        <div className="sub-badge">
          <Sparkles size={14} /> Premium Plans
        </div>
        <h1>Unlock Your Learning Potential</h1>
        <p>Choose the plan that fits your preparation needs</p>
        
        <div className="sub-billing-toggle">
          <button
            className={`sub-billing-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
            id="billing-monthly"
          >
            Monthly
          </button>
          <button
            className={`sub-billing-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
            id="billing-yearly"
          >
            Yearly <span className="sub-save-badge">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="sub-plans-grid animate-fadeInUp stagger-1">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`sub-plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
            id={`plan-${plan.id}`}
          >
            {plan.popular && (
              <div className="sub-plan-popular">
                <Star size={14} /> Most Popular
              </div>
            )}
            <div className="sub-plan-header" style={{ '--plan-color': plan.color }}>
              <h3>{plan.name}</h3>
              <div className="sub-plan-price">
                <span className="sub-plan-currency">₹</span>
                <span className="sub-plan-amount">
                  {billingPeriod === 'yearly' ? Math.round(plan.price * 0.8 * 12) : plan.price}
                </span>
                <span className="sub-plan-period">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="sub-plan-save">
                  Save ₹{Math.round(plan.price * 12 * 0.2).toLocaleString()} per year
                </p>
              )}
            </div>
            <div className="sub-plan-features">
              {plan.features.map((feature) => (
                <div key={feature} className="sub-plan-feature">
                  <Check size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg sub-plan-btn`}
              onClick={() => setShowPayment(true)}
              id={`select-${plan.id}`}
            >
              {plan.popular ? 'Get Started' : 'Choose Plan'} <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="sub-payment-overlay animate-fadeIn" onClick={() => setShowPayment(false)}>
          <div className="sub-payment-modal animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h2><CreditCard size={20} /> Payment Details</h2>
            <p className="sub-payment-subtitle">
              Subscribing to <strong>{subscriptionPlans.find(p => p.id === selectedPlan)?.name}</strong> plan
            </p>
            
            <div className="sub-payment-form">
              <div className="form-group">
                <label htmlFor="card-name" className="form-label">Name on Card</label>
                <input type="text" id="card-name" className="form-input" placeholder="Enter cardholder name" />
              </div>
              <div className="form-group">
                <label htmlFor="card-number" className="form-label">Card Number</label>
                <input type="text" id="card-number" className="form-input" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="sub-payment-row">
                <div className="form-group">
                  <label htmlFor="card-expiry" className="form-label">Expiry Date</label>
                  <input type="text" id="card-expiry" className="form-input" placeholder="MM/YY" />
                </div>
                <div className="form-group">
                  <label htmlFor="card-cvv" className="form-label">CVV</label>
                  <input type="text" id="card-cvv" className="form-input" placeholder="123" />
                </div>
              </div>

              <div className="sub-payment-summary">
                <div className="sub-payment-line">
                  <span>{subscriptionPlans.find(p => p.id === selectedPlan)?.name} Plan</span>
                  <span>₹{
                    billingPeriod === 'yearly'
                      ? Math.round(subscriptionPlans.find(p => p.id === selectedPlan)?.price * 0.8 * 12).toLocaleString()
                      : subscriptionPlans.find(p => p.id === selectedPlan)?.price.toLocaleString()
                  }</span>
                </div>
                <div className="sub-payment-line">
                  <span>GST (18%)</span>
                  <span>₹{Math.round(subscriptionPlans.find(p => p.id === selectedPlan)?.price * 0.18).toLocaleString()}</span>
                </div>
                <div className="sub-payment-line total">
                  <span>Total</span>
                  <span>₹{Math.round(subscriptionPlans.find(p => p.id === selectedPlan)?.price * 1.18).toLocaleString()}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} id="pay-now">
                <Lock size={16} /> Pay Now
              </button>
              
              <div className="sub-payment-secure">
                <Shield size={14} />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="sub-faq animate-fadeInUp stagger-3">
        <h3>Frequently Asked Questions</h3>
        <div className="sub-faq-list">
          {[
            { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway.' },
            { q: 'Is there a refund policy?', a: 'Yes, we offer a 7-day money-back guarantee if you are not satisfied with the platform.' },
            { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. The prorated amount will be adjusted in your next billing cycle.' },
          ].map((faq, idx) => (
            <details key={idx} className="sub-faq-item" id={`faq-${idx}`}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
