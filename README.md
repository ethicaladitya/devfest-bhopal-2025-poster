# Swadeshi Poster Creator

A modern, interactive web application for creating personalized awareness posters with custom photos and messages.

![Swadeshi Poster Creator](https://via.placeholder.com/800x400?text=Swadeshi+Poster+Creator)

## Features

🎨 **Custom Poster Generation**
- Professional poster templates for awareness campaigns
- Square or circular frame options for user photos
- Real-time preview of the final poster

📷 **Multiple Photo Input Methods**
- Camera capture with live preview
- File upload with photo editor
- Drag, resize, and reposition uploaded images

✏️ **Message Customization**
- Customizable awareness messages
- Multiple template options
- Real-time preview on poster

📱 **Mobile Responsive**
- Optimized for all screen sizes
- Touch-friendly interface
- Progressive Web App ready

🚀 **Sharing & Download**
- High-quality PNG download
- Native sharing API support
- Social media optimized output

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **HTML5 Canvas** for poster generation
- **Web APIs** for camera and sharing

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/swadeshi-poster-creator.git
cd swadeshi-poster-creator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment Options

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/swadeshi-poster-creator)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/swadeshi-poster-creator)

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to any static hosting service:
   - GitHub Pages
   - Cloudflare Pages
   - Firebase Hosting
   - AWS S3 + CloudFront

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── CameraCapture.tsx
│   ├── PhotoEditor.tsx
│   ├── PosterPreview.tsx
│   └── MessageEditor.tsx
├── hooks/              # Custom React hooks
│   └── usePosterGenerator.ts
├── pages/              # Page components
│   ├── Index.tsx
│   └── NotFound.tsx
├── lib/                # Utilities
└── assets/             # Static assets
```

## Environment Setup

No environment variables required! The app works out of the box.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Camera Features**: Requires HTTPS in production for camera access.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React and Vite communities for excellent tooling

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/swadeshi-poster-creator/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

Made with ❤️ for the community by the swadeshi team