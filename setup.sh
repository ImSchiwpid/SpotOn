#!/bin/bash

echo "🚗 SPOT-ON Parking Platform - Quick Start Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend Setup
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend
npm install

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚙️  Please update backend/.env with your credentials${NC}"
fi

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../frontend
npm install

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env file...${NC}"
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxx
REACT_APP_SOCKET_URL=http://localhost:5000
EOF
    echo -e "${YELLOW}⚙️  Please update frontend/.env with your Razorpay key${NC}"
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Instructions
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your credentials:"
echo "   - MongoDB Atlas connection string"
echo "   - Razorpay keys (test mode)"
echo "   - SendGrid API key"
echo "   - Cloudinary credentials"
echo ""
echo "2. Start the backend server:"
echo "   ${BLUE}cd backend && npm run dev${NC}"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   ${BLUE}cd frontend && npm start${NC}"
echo ""
echo "4. Open your browser to:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete project overview"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - TESTING.md - Testing guide"
echo ""
echo "Happy coding! 🚀"
