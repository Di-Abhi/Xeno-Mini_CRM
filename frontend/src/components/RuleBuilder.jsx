import React, { useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';

const RuleBuilder = ({ rules, onChange, onPreview }) => {
  const [previewLoading, setPreviewLoading] = useState(false);

  const fieldOptions = [
    { value: 'totalSpent', label: 'Total Spent', type: 'number' },
    { value: 'visitCount', label: 'Visit Count', type: 'number' },
    { value: 'daysSinceLastOrder', label: 'Days Since Last Order', type: 'number' },
    { value: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'churned'] },
    { value: 'city', label: 'City', type: 'text' },
    { value: 'valueCategory', label: 'Value Category', type: 'select', options: ['new', 'regular', 'high-value', 'premium'] },
  ];

  const operatorOptions = {
    number: [
      { value: 'gt', label: 'Greater than' },
      { value: 'gte', label: 'Greater than or equal' },
      { value: 'lt', label: 'Less than' },
      { value: 'lte', label: 'Less than or equal' },
      { value: 'eq', label: 'Equal to' },
      { value: 'ne', label: 'Not equal to' },
    ],
    text: [
      { value: 'eq', label: 'Equal to' },
      { value: 'ne', label: 'Not equal to' },
    ],
    select: [
      { value: 'eq', label: 'Equal to' },
      { value: 'ne', label: 'Not equal to' },
      { value: 'in', label: 'In' },
      { value: 'nin', label: 'Not in' },
    ],
  };

  const addCondition = () => {
    const newCondition = {
      field: 'totalSpent',
      operator: 'gt',
      value: '',
    };

    onChange({
      ...rules,
      conditions: [...rules.conditions, newCondition],
    });
  };

  const removeCondition = (index) => {
    const newConditions = rules.conditions.filter((_, i) => i !== index);
    onChange({
      ...rules,
      conditions: newConditions,
    });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value,
    };

    // Reset operator and value when field changes
    if (field === 'field') {
      const fieldConfig = fieldOptions.find(f => f.value === value);
      newConditions[index].operator = operatorOptions[fieldConfig.type][0].value;
      newConditions[index].value = '';
    }

    onChange({
      ...rules,
      conditions: newConditions,
    });
  };

  const updateLogic = (logic) => {
    onChange({
      ...rules,
      logic,
    });
  };

  const handlePreview = async () => {
    if (rules.conditions.length === 0) return;

    setPreviewLoading(true);
    try {
      await onPreview(rules);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getFieldConfig = (fieldValue) => {
    return fieldOptions.find(f => f.value === fieldValue);
  };

  const renderValueInput = (condition, index) => {
    const fieldConfig = getFieldConfig(condition.field);

    if (fieldConfig.type === 'select') {
      if (condition.operator === 'in' || condition.operator === 'nin') {
        return (
          <select
            multiple
            className="input"
            value={Array.isArray(condition.value) ? condition.value : []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateCondition(index, 'value', values);
            }}
          >
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      } else {
        return (
          <select
            className="input"
            value={condition.value}
            onChange={(e) => updateCondition(index, 'value', e.target.value)}
          >
            <option value="">Select value</option>
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }
    } else if (fieldConfig.type === 'number') {
      return (
        <input
          type="number"
          className="input"
          placeholder="Enter value"
          value={condition.value}
          onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value) || '')}
        />
      );
    } else {
      return (
        <input
          type="text"
          className="input"
          placeholder="Enter value"
          value={condition.value}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Logic Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Match:</span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => updateLogic('AND')}
            className={`px-3 py-1 text-sm rounded-md border ${
              rules.logic === 'AND'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All conditions (AND)
          </button>
          <button
            type="button"
            onClick={() => updateLogic('OR')}
            className={`px-3 py-1 text-sm rounded-md border ${
              rules.logic === 'OR'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Any condition (OR)
          </button>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-4">
        {rules.conditions.map((condition, index) => {
          const fieldConfig = getFieldConfig(condition.field);
          const availableOperators = operatorOptions[fieldConfig.type];

          return (
            <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {/* Field Selector */}
              <div className="flex-1">
                <select
                  className="input"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                >
                  {fieldOptions.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator Selector */}
              <div className="flex-1">
                <select
                  className="input"
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                >
                  {availableOperators.map(operator => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div className="flex-1">
                {renderValueInput(condition, index)}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                disabled={rules.conditions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Condition Button */}
      <button
        type="button"
        onClick={addCondition}
        className="btn btn-secondary btn-sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </button>

      {/* Preview Button */}
      {rules.conditions.length > 0 && (
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewLoading}
          className="btn btn-primary btn-sm"
        >
          {previewLoading ? (
            <div className="spinner h-4 w-4 mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview Audience
        </button>
      )}
    </div>
  );
};

export default RuleBuilder;
