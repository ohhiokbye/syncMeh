# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy the maven wrapper and pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Make the wrapper executable
RUN chmod +x mvnw

# Download dependencies (this caches them in a separate image layer)
RUN ./mvnw dependency:go-offline

# Copy source code and build the jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets the PORT env variable automatically)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
