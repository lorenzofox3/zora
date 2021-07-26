# Contributing

Thanks for your willingness to contribute !

## Prerequisite 

Before implementing anything, please make sure there is an open ticket referring to the bug you are fixing or the wanted feature you are implementing. That's easier for us to track things and make sure we are adding code to something _useful_

However, if your intention is to improve the documentation, there is no need to open a ticket.

## Code

You'll need [nodejs](https://nodejs.org/en/) (version >= 15) installed on your machine. You will need npm (version >= 7) too as we are using npm workspaces.  

1. clone the project
2. run ``npm run install:ci && npm run build``
3. you can make a quick check everything is ok by running ``npm t``

This is a monorepo with various _sub packages_. Most of the time, you will work on a project at the same time, and they come with a dev script.

For example, if you are working on the assertion library: 
1. ``cd assert``
2. ``npm run dev``

Once you are done, make sure the integration does not break anything by running the build script and the tests at the root of the project.

## Questions

If you have any further question, please contact us through the Github discussions. 

Thanks again !


