'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Offer, OfferRole } from '@/types/offer';
import offersConfig from '@/../config/offers.json';

interface OfferStats {
  total: number;
  active: number;
  draft: number;
  views: number;
  bookings: number;
}

export default function OffersManagement() {
  const { user, loading } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({ total: 0, active: 0, draft: 0, views: 0, bookings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<OfferRole | 'all'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      const response = await fetch(`/api/offers?userId=${user?.uid}`);
      const data = await response.json();
      
      if (data.offers) {
        setOffers(data.offers);
        
        // Calculate stats
        const total = data.offers.length;
        const active = data.offers.filter((o: Offer) => o.active).length;
        const draft = data.offers.filter((o: Offer) => !o.active).length;
        const views = data.offers.reduce((sum: number, o: Offer) => sum + (o.views || 0), 0);
        const bookings = data.offers.reduce((sum: number, o: Offer) => sum + (o.bookings || 0), 0);
        
        setStats({ total, active, draft, views, bookings });
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (offerId: string) => {
    setIsUpdating(offerId);
    
    try {
      const response = await fetch(`/api/offers/${offerId}/publish`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchOffers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update offer status');
      }
    } catch (error) {
      console.error('Error toggling offer status:', error);
      alert('Failed to update offer status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    setIsUpdating(offerId);
    
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchOffers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer');
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOffers = selectedRole === 'all' 
    ? offers 
    : offers.filter(offer => offer.role === selectedRole);

  const userRoles = user && (user as any).roles ? 
    (user as any).roles.filter((role: string) => 
      ['artist', 'producer', 'engineer', 'videographer', 'studio'].includes(role)
    ) : [];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Offers</h1>
          <p className="text-gray-600 mt-1">
            Manage your service offerings and track performance
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '/onboarding/role-kit'}
            className="btn btn-secondary inline-flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Role Kit Wizard
          </button>
          <button className="btn btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Offer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Total Offers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
          <p className="text-xs text-gray-500">
            {offersConfig.limits.maxActiveOffers - stats.active} slots remaining
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Draft</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.draft}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.views}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.bookings}</p>
        </div>
      </div>

      {/* Limit Warning */}
      {stats.active >= offersConfig.limits.maxActiveOffers && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="ml-2 text-sm font-medium text-yellow-800">
              You've reached the maximum active offers limit ({offersConfig.limits.maxActiveOffers}).
              Deactivate an offer to create new ones.
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedRole('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedRole === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({offers.length})
        </button>
        
        {userRoles.map((role: OfferRole) => {
          const count = offers.filter(o => o.role === role).length;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                selectedRole === role 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role} ({count})
            </button>
          );
        })}
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedRole === 'all' ? 'No offers yet' : `No ${selectedRole} offers yet`}
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first offer or using the Role Kit Wizard
          </p>
          <div className="space-x-3">
            <button 
              onClick={() => window.location.href = '/onboarding/role-kit'}
              className="btn btn-secondary"
            >
              Use Role Kit Wizard
            </button>
            <button className="btn btn-primary">
              Create Custom Offer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map(offer => (
            <OfferCard 
              key={offer.id}
              offer={offer}
              isUpdating={isUpdating === offer.id}
              onToggleActive={() => handleToggleActive(offer.id)}
              onDelete={() => handleDeleteOffer(offer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ 
  offer, 
  isUpdating, 
  onToggleActive, 
  onDelete 
}: { 
  offer: Offer;
  isUpdating: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <span className={`ml-3 px-2 py-1 text-xs rounded-full capitalize ${
              offer.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {offer.active ? 'Active' : 'Draft'}
            </span>
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
              {offer.role}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{offer.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Price:</span> ${offer.price} {offer.currency}
            </div>
            <div>
              <span className="font-medium">Turnaround:</span> {offer.turnaroundDays} days
            </div>
            <div>
              <span className="font-medium">Views:</span> {offer.views || 0}
            </div>
            <div>
              <span className="font-medium">Bookings:</span> {offer.bookings || 0}
            </div>
          </div>
          
          <div className="mt-3">
            <span className="font-medium text-sm">Includes:</span>
            <div className="text-sm text-gray-600 mt-1">
              {offer.deliverables.slice(0, 3).join(' • ')}
              {offer.deliverables.length > 3 && (
                <span className="text-gray-500"> • +{offer.deliverables.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-6">
          <button 
            onClick={onToggleActive}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors ${
              offer.active 
                ? 'text-yellow-600 hover:bg-yellow-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={offer.active ? 'Deactivate offer' : 'Activate offer'}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : offer.active ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          
          <button 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit offer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onDelete}
            disabled={isUpdating}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete offer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}