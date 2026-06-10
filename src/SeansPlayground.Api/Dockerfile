FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SeansPlayground.slnx ./
COPY src/SeansPlayground.Api/SeansPlayground.Api.csproj src/SeansPlayground.Api/
COPY src/SeansPlayground.Contracts/SeansPlayground.Contracts.csproj src/SeansPlayground.Contracts/
COPY src/SeansPlayground.Core/SeansPlayground.Core.csproj src/SeansPlayground.Core/
COPY src/SeansPlayground.Services/SeansPlayground.Services.csproj src/SeansPlayground.Services/
RUN dotnet restore src/SeansPlayground.Api/SeansPlayground.Api.csproj

COPY src/ src/
RUN dotnet publish src/SeansPlayground.Api/SeansPlayground.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SeansPlayground.Api.dll"]
