import React, { useState } from 'react';
import { X } from 'lucide-react';

const OverlayEditor = ({ overlay, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: overlay?.name || '',
    type: overlay?.type || 'text',
    content: overlay?.content || '',
    src: overlay?.src || '',
    position: overlay?.position || { x: 50, y: 50 },
    size: overlay?.size || { width: 200, height: 100 },
    color: overlay?.color || '#ffffff',
    fontSize: overlay?.fontSize || 16,
    fontFamily: overlay?.fontFamily || 'Arial',
    opacity: overlay?.opacity || 1,
    rotation: overlay?.rotation || 0,
    visible: overlay?.visible !== undefined ? overlay.visible : true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {overlay ? 'Edit Overlay' : 'Create Overlay'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="logo">Logo</option>
              </select>
            </div>
          </div>

          {formData.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <input
                type="text"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {formData.type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="src"
                value={formData.src}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {formData.type === 'logo' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo Text
              </label>
              <input
                type="text"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position X (%)
              </label>
              <input
                type="number"
                name="position.x"
                value={formData.position.x}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position Y (%)
              </label>
              <input
                type="number"
                name="position.y"
                value={formData.position.y}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Width (px)
              </label>
              <input
                type="number"
                name="size.width"
                value={formData.size.width}
                onChange={handleChange}
                min="10"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Height (px)
              </label>
              <input
                type="number"
                name="size.height"
                value={formData.size.height}
                onChange={handleChange}
                min="10"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.type === 'text' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  name="fontSize"
                  value={formData.fontSize}
                  onChange={handleChange}
                  min="8"
                  max="72"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opacity
              </label>
              <input
                type="range"
                name="opacity"
                value={formData.opacity}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.1"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400">{formData.opacity}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rotation (degrees)
              </label>
              <input
                type="range"
                name="rotation"
                value={formData.rotation}
                onChange={handleChange}
                min="-180"
                max="180"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400">{formData.rotation}°</span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="visible"
              checked={formData.visible}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-300">
              Visible
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Save Overlay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverlayEditor;