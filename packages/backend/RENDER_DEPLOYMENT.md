# Deploying to Render

This guide provides step-by-step instructions for deploying the Gasless Swap backend to Render.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com) if you don't have one)
- Access to the GitHub repository: [https://github.com/big14way/gasless-swap.git](https://github.com/big14way/gasless-swap.git)

## Deployment Steps

### Option 1: Manual Deployment

1. **Create a new Web Service on Render**
   - Log in to your Render dashboard
   - Click on "New" and select "Web Service"

2. **Connect your GitHub repository**
   - Select "GitHub" as the deployment option
   - Connect your GitHub account if not already connected
   - Search for and select the `big14way/gasless-swap` repository

3. **Configure the service**
   - **Name**: `gasless-swap-backend` (or your preferred name)
   - **Root Directory**: `packages/backend`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`

4. **Add environment variables**
   - Scroll down to the "Environment" section
   - Add the following environment variables:
     ```
     APP_NAME=Gasless Swap API
     PORT=3001
     ALCHEMY_API_KEY=xK5UUg_CThKPWlfCEDjuN_Es8wFFQ1zk
     PRIVATE_KEY=0xb5bba28246a3faed68d623ba0cc5cf129b00bdbeaa5e29ed7ce6a41688cdfaa1
     GASLESS_SWAP_CONTRACT_ADDRESS=0x571B4228e412fC2ebaA209a75651BDE93ce4B4c2
     OWNER_ADDRESS=0x1B858848F8b57bA2169A60706D1c27569d369BC9
     OWNER_PRIVATE_KEY=0xb5bba28246a3faed68d623ba0cc5cf129b00bdbeaa5e29ed7ce6a41688cdfaa1
     RPC_URL_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/xK5UUg_CThKPWlfCEDjuN_Es8wFFQ1zk
     DB_URL=mongodb+srv://ejeziefranklin:Q34BladRnLWTDN6D@swap-001.80akihk.mongodb.net/?retryWrites=true&w=majority&appName=Swap-001
     ```

5. **Deploy the service**
   - Click on "Create Web Service"
   - Render will start the deployment process
   - Wait for the build and deployment to complete

### Option 2: Automatic Deployment with Blueprint

1. **Push the render.yaml file to your repository**
   - The `render.yaml` file has already been created in the backend directory
   - Commit and push this file to your repository

2. **Use Render Blueprints**
   - Go to the Render Dashboard
   - Click on "Blueprints"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and create the services defined in it
   - You'll still need to add the environment variables manually in the Render dashboard

## Creating a Remote Branch for Deployment

After deploying to Render, create a remote branch to save your deployment configuration:

```bash
# Navigate to the project root
cd /Users/user/gwill/web3/gasless-swap

# Create a new branch
git checkout -b backend-deploy

# Add the changes in the backend directory
git add packages/backend/

# Commit the changes
git commit -m "Deploy backend to Render"

# Push to the remote repository
git push origin backend-deploy
```

Alternatively, you can use the provided deployment script:

```bash
# Navigate to the backend directory
cd packages/backend

# Make the script executable (if not already)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

## Verifying Deployment

After deployment is complete:

1. Go to the URL provided by Render (e.g., `https://gasless-swap-backend.onrender.com`)
2. You should see the welcome message from the backend
3. Test the health endpoint at `/health`
4. Test the API endpoints at `/api/swap` and `/api/history`

## Troubleshooting

- If the build fails, check the build logs in the Render dashboard
- Ensure all environment variables are correctly set
- Check the application logs for runtime errors
- Verify that the MongoDB connection is working properly