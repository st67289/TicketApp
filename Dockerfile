#  Fáze 1: Sestavení Aplikace (Builder)
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /workspace

COPY backend/gradlew .
COPY backend/gradle ./gradle
COPY backend/build.gradle .
COPY backend/settings.gradle .

COPY backend/src ./src

RUN ./gradlew build --no-daemon -x test

#  Fáze 2: Finální Běhový Image

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]