# run.py
from flask import Flask
from server.app import create_app
from json import load
from server.db import db

if __name__ == '__main__':

    config = load(open('config.json', 'r'))
    site_config = config['site_config']
    
    config_path = 'config.json'
    
    # Create the app with the configuration
    app = create_app(config_path=config_path)

    # Create database tables (if they don't already exist)
    with app.app_context():
        db.create_all()

    # Initialize Website and Backend API
    from server.website import Website
    from server.backend import Backend_Api

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
