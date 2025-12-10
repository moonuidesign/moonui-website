export const AvatarGroup = () => (
  <div className="flex justify-start items-start pr-1">
    {[1, 2, 3, 4].map((_, i) => (
      <div
        key={i}
        className={`w-5 h-6 max-w-20 relative ${i !== 0 ? 'w-5' : 'w-6'}`}
      >
        <img
          className={`w-6 h-6 rounded-full shadow-[0px_0px_0px_2px_rgba(247,247,247,1.00)] object-cover ${
            i !== 0 ? 'absolute left-[-4px] top-0' : 'relative'
          }`}
          src={`https://placehold.co/24x24?text=${i + 1}`}
          alt="User avatar"
        />
      </div>
    ))}
  </div>
);
