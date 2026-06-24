"""
Vellare Doces — Configuração da Aplicação
==========================================
Leitura de variáveis de ambiente via Pydantic Settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação, lidas do .env ou variáveis de ambiente."""

    # Database
    database_url: str = "postgresql://vellare_user:vellare_secret_2024@db:5432/vellare_db"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # CORS — origens permitidas, separadas por vírgula
    cors_origins: str = "http://localhost,http://localhost:80"

    # Admin
    admin_key: str = "vellare-admin-2024"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        """Retorna as origens CORS como lista."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Singleton — importar diretamente
settings = Settings()
