export default function StatsSection() {
  const stats = [
    { value: "98%", label: "5-Star Review Rate", color: "text-red-500" },
    { value: "24/7", label: "Automated Response", color: "text-teal-600" },
    { value: "85%", label: "Time Saved", color: "text-green-500" },
    { value: "50+", label: "Message Templates", color: "text-blue-500" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${stat.color} mb-2`} data-testid={`stat-value-${index}`}>
                {stat.value}
              </div>
              <div className="text-gray-600" data-testid={`stat-label-${index}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
