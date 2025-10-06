


const TemplateSidebar = ({ templates, onSelect }) => {
  return (
    <div className="w-64 border-r h-full p-4 bg-white">
      <h3 className="text-lg font-bold mb-3">Email Templates</h3>
      <ul>
        {Object.keys(templates).map((name) => (
          <li key={name}>
            <button
              className="text-blue-600 hover:underline mb-2"
              onClick={() => onSelect(name)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateSidebar;
