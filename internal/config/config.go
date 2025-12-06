package config

import (
	"fmt"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
	Log      LogConfig
}

type ServerConfig struct {
	Port string
	Host string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret      string
	ExpiryHours int
}

type CORSConfig struct {
	AllowedOrigins []string
}

type LogConfig struct {
	Level string
}

var AppConfig *Config

// LoadConfig loads static configuration directly (no env file)
func LoadConfig() (*Config, error) {

	config := &Config{
		Server: ServerConfig{
			Port: "8080",
			Host: "localhost",
			Env:  "development",
		},
		Database: DatabaseConfig{
			Host:     "localhost",
			Port:     "3306",
			User:     "root",
			Password: "root",
			DBName:   "TextTile",
		},
		JWT: JWTConfig{
			Secret:      "pos-super-secret-jwt-key-2024-change-in-production",
			ExpiryHours: 24,
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{
				"http://localhost:5173",
				"http://localhost:3000",
			},
		},
		Log: LogConfig{
			Level: "debug",
		},
	}

	AppConfig = config
	return config, nil
}

// GetDSN returns MySQL connection string
func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.DBName,
	)
}
