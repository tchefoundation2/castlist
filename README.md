# Castlist: Standalone Sandbox Mode

This directory contains the complete, self-contained `castlist` mini-application. It is designed as a "sandbox" that can be easily extracted and run as a standalone project.

This ensures the application is decoupled, stable, and can be developed or deployed independently.

## How to Run Standalone

To run the `castlist` app on its own (e.g., in a new repository or for isolated development), follow these simple steps:

1.  **Create a New Project Folder:**
    ```bash
    mkdir castlist-standalone
    cd castlist-standalone
    ```

2.  **Copy Contents:**
    Copy **all** files and folders from this `app/castlist` directory into your new `castlist-standalone` folder. This includes the `metadata.json` file required by the platform.

3.  **Rename Bootstrap Files:**
    Inside your new folder, rename the bootstrap files to `index.html` and `index.tsx`:
    -   Rename `standalone.html` to `index.html`
    -   Rename `standalone.tsx` to `index.tsx`

4.  **Done!**
    The project is now a complete, runnable application. You can serve the `index.html` file with any static file server to see it in action.