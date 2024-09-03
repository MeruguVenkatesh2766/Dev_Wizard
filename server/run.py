# run.py
from flask import Flask
from src.app import create_app
from json import load

if __name__ == '__main__':

    config = load(open('config.json', 'r'))
    site_config = config['site_config']
    
    config_path = 'config.json'
    
    # Create the app with the configuration
    app = create_app(config_path=config_path)

    # Initialize Website and Backend API
    from src.website import Website
    from src.backend import Backend_Api

    site = Website(app)
    for route in site.routes:
        app.add_url_rule(
            route,
            view_func=site.routes[route]['function'],
            methods=site.routes[route]['methods'],
        )

    backend_api = Backend_Api(config)
    for route in backend_api.routes:
        app.add_url_rule(
            route,
            view_func=backend_api.routes[route]['function'],
            methods=backend_api.routes[route]['methods'],
        )

    # Run the application
    print(f"Running on port {site_config['port']}")
    app.run(**site_config)
    print(f"Closing port {site_config['port']}")
