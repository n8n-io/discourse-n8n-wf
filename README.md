## About

This is a plugin that detects when JSON representing an n8n workflow is present in a post, and replaces it with an interactive rendering of the workflow.

## To install Discourse

From https://meta.discourse.org/t/beginners-guide-to-install-discourse-for-development-using-docker/102009

```
git clone https://github.com/discourse/discourse.git
cd discourse
```

In the Discourse root dir:

```
d/boot_dev --init
    # wait while:
    #   - dependencies are installed,
    #   - the database is migrated, and
    #   - an admin user is created (you'll need to interact with this)

# In one terminal:
d/rails s

# And in a separate terminal
d/ember-cli
```

## To install the plugin

```
cd discourse/plugins
git clone <this repository>
```

# Discourse settings

You need to whitelist the domain your iframes are calling in the admin settings of Discourse
