import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getOverlays, createOverlay, updateOverlay, deleteOverlay } from '../services/api';
import OverlayEditor from '../components/OverlayEditor';

const OverlayManager = () => {
  const [overlays, setOverlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    loadOverlays();
  }, []);

  const loadOverlays = async () => {
    try {
      const data = await getOverlays();
      setOverlays(data);
    } catch (error) {
      console.error('Failed to load overlays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOverlay = () => {
    setSelectedOverlay(null);
    setIsEditorOpen(true);
  };

  const handleEditOverlay = (overlay) => {
    setSelectedOverlay(overlay);
    setIsEditorOpen(true);
  };

  const handleDeleteOverlay = async (id) => {
    if (window.confirm('Are you sure you want to delete this overlay?')) {
      try {
        await deleteOverlay(id);
        loadOverlays();
      } catch (error) {
        console.error('Failed to delete overlay:', error);
      }
    }
  };

  const handleToggleVisibility = async (overlay) => {
    try {
      await updateOverlay(overlay.id, { ...overlay, visible: !overlay.visible });
      loadOverlays();
    } catch (error) {
      console.error('Failed to update overlay:', error);
    }
  };

  const handleSaveOverlay = async (overlayData) => {
    try {
      if (selectedOverlay) {
        await updateOverlay(selectedOverlay.id, overlayData);
      } else {
        await createOverlay(overlayData);
      }
      loadOverlays();
      setIsEditorOpen(false);
      setSelectedOverlay(null);
    } catch (error) {
      console.error('Failed to save overlay:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Overlay Manager</h1>
        <button
          onClick={handleCreateOverlay}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Overlay
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overlays.map((overlay) => (
          <div key={overlay.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{overlay.name}</h3>
                <p className="text-sm text-gray-400 capitalize">{overlay.type}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleVisibility(overlay)}
                  className={`p-2 rounded ${
                    overlay.visible
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white transition-colors`}
                >
                  {overlay.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEditOverlay(overlay)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOverlay(overlay.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>Position: {overlay.position.x}%, {overlay.position.y}%</p>
              <p>Size: {overlay.size.width}x{overlay.size.height}px</p>
              {overlay.type === 'text' && (
                <p>Content: "{overlay.content}"</p>
              )}
              {overlay.type === 'image' && (
                <p>Source: {overlay.src}</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-700 rounded">
              <p className="text-xs text-gray-400">Preview</p>
              <div className="mt-2 h-16 bg-gray-900 rounded relative overflow-hidden">
                <div
                  className="absolute"
                  style={{
                    left: `${overlay.position.x * 0.5}%`,
                    top: `${overlay.position.y * 0.3}%`,
                    transform: `scale(0.5)`,
                    transformOrigin: 'top left',
                  }}
                >
                  {overlay.type === 'text' && (
                    <div
                      className="text-white font-bold"
                      style={{
                        fontSize: `${overlay.fontSize || 16}px`,
                        color: overlay.color || '#ffffff',
                      }}
                    >
                      {overlay.content}
                    </div>
                  )}
                  {overlay.type === 'logo' && (
                    <div className="w-16 h-8 bg-blue-600 text-white text-xs flex items-center justify-center rounded">
                      {overlay.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {overlays.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No overlays created yet.</p>
          <button
            onClick={handleCreateOverlay}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Overlay
          </button>
        </div>
      )}

      {isEditorOpen && (
        <OverlayEditor
          overlay={selectedOverlay}
          onSave={handleSaveOverlay}
          onCancel={() => {
            setIsEditorOpen(false);
            setSelectedOverlay(null);
          }}
        />
      )}
    </div>
  );
};

export default OverlayManager;