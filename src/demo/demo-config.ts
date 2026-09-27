// The portfolio deployment must remain usable when no environment variables
// are configured. Live backend mode is therefore an explicit opt-out.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
