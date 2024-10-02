interface DashboardCardProps {
    title: string;
    count: number;
  }
  
  export default function DashboardCard({ title, count }: DashboardCardProps) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-3xl font-bold mt-2">{count}</p>
      </div>
    );
  }
  