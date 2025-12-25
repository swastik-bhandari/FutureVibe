import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./configs/db";

const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });
