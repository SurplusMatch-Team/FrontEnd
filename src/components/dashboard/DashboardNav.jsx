import { NavLink } from "react-router-dom";

const linkBase =
  "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition md:px-5";

function DashboardNav({ role }) {
  const isMarket = role === "MARKET";

  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          `${linkBase} ${
            isActive
              ? "border-slate-800 bg-slate-800 text-white shadow-md"
              : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white"
          }`
        }
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-xs">⌂</span>
        Overview
      </NavLink>

      {isMarket ? (
        <>
          <NavLink
            to="/dashboard/market/add-product"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "border-cyan-600 bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                  : "border-cyan-100 bg-cyan-50/80 text-cyan-800 hover:border-cyan-200 hover:bg-cyan-50"
              }`
            }
          >
            <span className="text-base leading-none">+</span>
            Add product
          </NavLink>
          <NavLink
            to="/dashboard/market/my-products"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "border-cyan-600 bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                  : "border-cyan-100 bg-cyan-50/80 text-cyan-800 hover:border-cyan-200 hover:bg-cyan-50"
              }`
            }
          >
            <span className="text-xs font-bold">≡</span>
            My products
          </NavLink>
        </>
      ) : (
        <NavLink
          to="/dashboard/ngo/browse-offers"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "border-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                : "border-emerald-100 bg-emerald-50/80 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50"
            }`
          }
        >
          <span className="text-xs">◇</span>
          Browse offers
        </NavLink>
      )}
    </nav>
  );
}

export default DashboardNav;
