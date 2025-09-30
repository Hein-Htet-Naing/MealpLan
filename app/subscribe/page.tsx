import { availablePlans } from "@/lib/plan";
const Subscribe = () => {
  return (
    <main className="px-4 py-8 sm:py-12 lg:py-16">
      <div>
        <h2 className="text-3xl font-bold text-center mt-12 sm:text-5xl tracking-tight">
          Pricing
        </h2>
        <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
          Get started on our weekly plan or upgrade to monthly or yearly when
          you’re ready.
        </p>
      </div>
      <div className="mt-12 container mx-auto space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
        {/* Map over availablePlans to render plan cards */}

        <div className="flex-1">
          <div>
            <h2 className="text-3xl font-bold text-center mt-12 sm:text-5xl tracking-tight">
              Pricing
            </h2>
            <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
              Get started on our weekly plan or upgrade to monthly or yearly
              when you’re ready.
            </p>
          </div>
          {/* Conditionally render "Most popular" label */}
          {availablePlans.map((plan, key) => (
            <div key={key}>
              <div className="flex-1">
                {/* Conditionally render "Most popular" label */}
                {plan.isPopular && (
                  <p className="absolute top-0 py-1.5 px-4 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                    Most popular
                  </p>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ${plan.amount}
                  </span>
                  <span className="ml-1 text-xl font-semibold">
                    /{plan.interval}
                  </span>
                </p>
                <p className="mt-6">{plan.description}</p>
                <ul role="list" className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 w-6 h-6 text-emerald-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="ml-3">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button>Subscribe {plan.name}</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Subscribe;
