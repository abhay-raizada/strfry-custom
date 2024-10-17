# Start from the existing strfry image
FROM dockurr/strfry

# Install Node.js and npm
RUN apk --no-cache add nodejs npm

# Set the working directory
WORKDIR /app

# Copy the package.json file into the image
COPY package.json /app/package.json

# Install dependencies
RUN npm install

# Copy the whitelist.js file into the image
COPY whitelist.js /app/whitelist.js

# Make the whitelist.js executable
RUN chmod a+x /app/whitelist.js

# Expose the port your application will run on
EXPOSE 7777

# Set the entrypoint to use the original strfry entrypoint
ENTRYPOINT ["/app/strfry"]
CMD ["relay"]
