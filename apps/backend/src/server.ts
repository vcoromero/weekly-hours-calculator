import app from "./infrastructure/http/app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
