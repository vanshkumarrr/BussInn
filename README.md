# RideMate Connect

You are an expert React.js frontend architect.

I already have the UI design (provided in the ZIP). DO NOT redesign anything. DO NOT change any UI. DO NOT create any CSS design.

Your job is ONLY to create the complete frontend project structure and navigation.

Tech Stack

 React JS

 React Router DOM

 Plain CSS

 JavaScript (NOT TypeScript)

Important

Do NOT design the pages.

Every page should simply contain something like:

const Login = () => {
    return (
        <div className="page">
            <h1>Login Page</h1>
        </div>
    );
}

export default Login;

Every page should have its own CSS file.

Example

Login.jsx
Login.css

The css file can simply contain

.page{

}

I will design every page myself later.

Create Complete Folder Structure

src/

pages/

components/

styles/

App.jsx

main.jsx

Each page should have its own CSS inside styles folder.

Configure React Router

Set up complete routing.

Import every page.

Connect every route.

Wrap inside BrowserRouter.

Everything should already work.

Workflow

Authentication Flow

Welcome
      ↓
Login
      ↓
Basic Details
      ↓
Role Selection

Role Selection

Show two buttons

Driver
Passenger

If Driver

Driver Setup

If Passenger

Passenger Choice

Navigation should already work.

Leave UI minimal.

DRIVER FLOW

Driver Setup

Button

Continue

↓

Driver Dashboard

Driver Dashboard

Only create navigation.

Don't create UI.

Add comments explaining where dashboard UI will come.

Bottom Navigation should contain

Dashboard
Recent Trips
Coins
Profile

Every button should navigate correctly.

Driver Dashboard Button

There should be

Start Trip

When clicked

↓

Live Tracking Page

Live Tracking Page

Button

End Trip

↓

Recent Trips

or

Driver Dashboard

(add comments showing where backend logic will be added)

Driver Recent Trips Page

Basic placeholder only.

Driver Coins Page

Basic placeholder only.

Driver Profile

Create navigation for

Redeem Coins

Refer & Earn

About Us

Help

Feedback

Logout

Each option must open its own page.

Logout should navigate to Login page.

PASSENGER FLOW

After Role Selection

↓

Passenger Choice

Show two options

I am Searching For Bus

I am Inside Bus

Searching For Bus

↓

Search Page

Create only placeholder.

There should be a Search Button.

When clicked

↓

Live Bus Results

Live Bus Results

Basic placeholder.

Each result should navigate to

Ride Details

Ride Details

Button

Track Live Bus

↓

Live Trip Tracking

Live Trip Tracking

Basic placeholder.

Inside Bus

Create page

Inside Bus

This page should later allow QR scan / Bus ID.

Only placeholder.

Passenger Bottom Navigation

Exactly like the screenshots.

Search

Ride

Rewards

Profile

Navigation should already work.

Every page should contain this bottom navbar.

Do NOT design it.

Just create placeholder.

Passenger Pages

Create all of these.

Passenger Dashboard (optional landing)

Search

Live Bus Results

Ride Details

Live Trip Tracking

Ride History

Rewards

Profile

Help

Feedback

About Us

Redeem Coins

Refer & Earn

Common Pages

Also create these pages.

Welcome

Login

Basic Details

Role Selection

Driver Setup

Passenger Choice

Help

Feedback

About Us

Redeem Coins

Refer & Earn

404 Not Found

Components

Create reusable placeholder components.

DriverBottomNav.jsx

PassengerBottomNav.jsx

ProtectedRoute.jsx (only placeholder)

Layout.jsx

Button.jsx

No styling.

Only basic JSX.

Comments

Throughout the project write useful comments.

Example

// TODO:
// Add backend API here

// Navigate after successful login

// Fetch driver trips here

// Fetch live location here

// Add Google Maps integration here

// Add Socket.IO live updates here

// Connect rewards API here

// Add authentication check here

// Add QR scanner here

App.jsx

Already configure every route.

Do not leave anything disconnected.

Navigation

All buttons should already navigate correctly.

Example

Welcome

↓

Login

↓

Basic Details

↓

Role Selection

↓

Driver Setup

↓

Driver Dashboard

↓

Live Tracking

↓

Recent Trips

and

Welcome

↓

Login

↓

Basic Details

↓

Role Selection

↓

Passenger Choice

↓

Search

↓

Live Bus Results

↓

Ride Details

↓

Live Tracking

Everything should already be connected.

CSS

Create CSS files for every page.

Do NOT style anything.

Only create empty class structure.

Example

.page{

}

.container{

}

.header{

}

.content{

}

.footer{

}

Final Requirement

The output should be a complete React frontend skeleton with:

 every folder created

 every page created

 every CSS file created

 every component created

 complete React Router setup

 navigation already working

 placeholder content only

 no UI design

 no backend

 no API integration

 detailed comments explaining where future code (UI, backend, maps, authentication, sockets, rewards, etc.) should be added.

Do not skip any page from the workflow shown in the provided ZIP/screenshots. Create a complete project scaffold that I can immediately start designing page by page.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ed2636a-bb04-4c2e-858b-e3d34ebb0b56).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
