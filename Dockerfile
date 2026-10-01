FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
RUN mvn -B dependency:go-offline

COPY src src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /workspace/target/mood-tracker-1.0.0.jar app.jar

EXPOSE 8081
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
