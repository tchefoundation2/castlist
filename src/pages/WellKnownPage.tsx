import React from 'react';

const WellKnownPage: React.FC = () => {
  const manifest = {
    "name": "Castlist",
    "description": "Transform your Readings into a Social Journey",
    "icon": "/farcaster-white.svg",
    "splash": {
      "icon": "/farcaster-white.svg",
      "background": "#8A63D2"
    },
    "screenshots": [
      {
        "url": "/screenshot1.png",
        "alt": "Castlist Home Screen"
      },
      {
        "url": "/screenshot2.png", 
        "alt": "Castlist Guide Creation"
      }
    ],
    "permissions": [
      "user:read",
      "user:write"
    ],
    "version": "1.0.0",
    "developer": {
      "name": "Castlist Team",
      "url": "https://castlist.app"
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjExODM2MTAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg3NEZiNzMzODA0NzMwZDVkOEM2ZUEwNDRmYWUzZTVkNjY2MzY2ODI3In0",
      "payload": "eyJkb21haW4iOiJmMjdhZmJiMzgwMTEubmdyb2stZnJlZS5hcHAifQ",
      "signature": "Piy5+ObxTJd9d1XWuEobYqT873GbFS3oVwTfJeBiu3NbsnQ+VJ+L6cyWEQQzvi8fgp2+vkwPiOD4FbbzF8Ra7Bs="
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        {JSON.stringify(manifest, null, 2)}
      </pre>
    </div>
  );
};

export default WellKnownPage;
