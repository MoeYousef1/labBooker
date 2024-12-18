import React from "react";

const FormInput = ({ type, name, value, onChange, label, error, required = false }) => {
  const inputClasses =
    "peer w-full p-3 border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";
  const labelClasses =
    "absolute left-3 top-1 text-xs text-blue-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-700 font-semibold";

  return (
    <div className="mb-4 relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClasses} ${error ? "border-red-500" : "border-gray-400"}`}
        placeholder=" "
        required={required} // Default is now `false` to avoid triggering native validation
      />
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
