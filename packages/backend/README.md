# Gasless Swap Backend

This is the backend service for the Gasless Swap application, which allows users to swap tokens without paying for gas.

## Local Development

1. Install dependencies:
   ```
   yarn install
   ```

2. Create a `.env` file with the required environment variables (see `.env.example`).

3. Run the development server:
   ```
   yarn dev
   ```

## Deployment to Render

### Manual Deployment

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Configure the service with the following settings:
   - **Name**: gasless-swap-backend
   - **Environment**: Node
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Root Directory**: `packages/backend` (if deploying from the monorepo)

4. Add the following environment variables in the Render dashboard:
   - `APP_NAME`: Gasless Swap API
   - `PORT`: 3001
   - `ALCHEMY_API_KEY`: Your Alchemy API key
   - `PRIVATE_KEY`: Your private key
   - `GASLESS_SWAP_CONTRACT_ADDRESS`: The contract address
   - `OWNER_ADDRESS`: The owner address
   - `OWNER_PRIVATE_KEY`: The owner private key
   - `RPC_URL_SEPOLIA`: The Sepolia RPC URL
   - `DB_URL`: Your MongoDB connection string

### Automatic Deployment with render.yaml

If you have a `render.yaml` file in your repository, you can use Render Blueprints for automatic deployment:

1. Push your code to GitHub.
2. Go to the Render Dashboard and click on "Blueprints".
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and create the services defined in it.

## API Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint
- `POST /api/swap`: Swap tokens without paying gas
- `GET /api/history`: Get swap history

## Creating a Remote Branch

After deploying to Render, you can create a remote branch for the backend:

```bash
# Navigate to the backend directory
cd packages/backend

# Create a new branch
git checkout -b backend-deploy

# Add your changes
git add .

# Commit your changes
git commit -m "Deploy backend to Render"

# Push to the remote repository
git push origin backend-deploy
```