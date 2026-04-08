using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Data.Sqlite;
using HRDashboard.BusinessLayer.Structure;

var builder = WebApplication.CreateBuilder(args);

// ── Connection string ─────────────────────────────────────────────────────────
HRDashboard.DataAccess.DbSession.ConnectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

// ── JWT — key is read from appsettings, never hardcoded ──────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing. Add it to appsettings.Development.json.");

// Share the key with TokenService so it has no hardcoded copy either
TokenService.SecretKey = jwtKey;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = "HRDashboard",
        ValidAudience            = "HRDashboardClient",
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
    });
builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(opt => opt.AddPolicy("ReactApp", policy =>
    policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
          .AllowAnyHeader().AllowAnyMethod()));

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRDashboard API", Version = "v2.0" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name        = "Authorization", Type = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer",        BearerFormat = "JWT",
        In          = ParameterLocation.Header,
        Description = "Introdu: Bearer {token}",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
        Array.Empty<string>()
    }});
});

var app = builder.Build();

// ── Database bootstrap ────────────────────────────────────────────────────────
try
{
    var connStr   = builder.Configuration.GetConnectionString("DefaultConnection")!;
    var adminPw   = builder.Configuration["Seed:AdminPassword"]      ?? "changeme";
    var accountPw = builder.Configuration["Seed:AccountingPassword"] ?? "changeme";
    var hash1 = BCrypt.Net.BCrypt.HashPassword(adminPw);
    var hash2 = BCrypt.Net.BCrypt.HashPassword(accountPw);

    using var conn = new SqliteConnection(connStr);
    conn.Open();

    var create = conn.CreateCommand();
    create.CommandText = @"
        CREATE TABLE IF NOT EXISTS Users (
            Id           INTEGER PRIMARY KEY AUTOINCREMENT,
            Email        TEXT NOT NULL DEFAULT '',
            PasswordHash TEXT NOT NULL DEFAULT '',
            Name         TEXT NOT NULL DEFAULT '',
            Role         TEXT NOT NULL DEFAULT 'admin',
            CompanyId    TEXT NOT NULL DEFAULT '',
            CompanyName  TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS Drivers (
            Id               INTEGER PRIMARY KEY AUTOINCREMENT,
            Name             TEXT NOT NULL DEFAULT '',
            FirstName        TEXT NOT NULL DEFAULT '',
            LastName         TEXT NOT NULL DEFAULT '',
            CompanyId        TEXT NOT NULL DEFAULT '',
            Position         TEXT NOT NULL DEFAULT 'Company Driver',
            Equipment        TEXT NOT NULL DEFAULT 'Van',
            DriverStatus     TEXT NOT NULL DEFAULT 'Not Ready',
            PaymentType      TEXT NOT NULL DEFAULT 'miles',
            EmploymentStatus TEXT NOT NULL DEFAULT 'Working',
            IsEmployee       INTEGER NOT NULL DEFAULT 1,
            CreatedAt        TEXT NOT NULL DEFAULT '',
            Notes            TEXT
        );
        CREATE TABLE IF NOT EXISTS Applicants (
            Id        INTEGER PRIMARY KEY AUTOINCREMENT,
            Name      TEXT NOT NULL DEFAULT '',
            FirstName TEXT NOT NULL DEFAULT '',
            LastName  TEXT NOT NULL DEFAULT '',
            CompanyId TEXT NOT NULL DEFAULT '',
            Position  TEXT NOT NULL DEFAULT 'Company Driver',
            Equipment TEXT NOT NULL DEFAULT 'Unsigned',
            Status    TEXT NOT NULL DEFAULT 'Applied',
            IsDeleted INTEGER NOT NULL DEFAULT 0,
            CreatedAt TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS Documents (
            Id         INTEGER PRIMARY KEY AUTOINCREMENT,
            CompanyId  TEXT NOT NULL DEFAULT '',
            DriverId   INTEGER NOT NULL DEFAULT 0,
            DocType    TEXT NOT NULL DEFAULT '',
            Name       TEXT NOT NULL DEFAULT '',
            FileType   TEXT NOT NULL DEFAULT 'PDF',
            Size       TEXT NOT NULL DEFAULT '',
            Base64     TEXT NOT NULL DEFAULT '',
            UploadedAt TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS Statements (
            Id               TEXT PRIMARY KEY,
            CompanyId        TEXT NOT NULL DEFAULT '',
            DriverId         INTEGER NOT NULL DEFAULT 0,
            DriverName       TEXT NOT NULL DEFAULT '',
            PaymentType      TEXT NOT NULL DEFAULT 'miles',
            Miles            TEXT NOT NULL DEFAULT '0',
            RatePerMile      TEXT NOT NULL DEFAULT '0',
            Percent          TEXT NOT NULL DEFAULT '0',
            GrossAmount      TEXT NOT NULL DEFAULT '0',
            AdjustmentType   TEXT NOT NULL DEFAULT 'none',
            AdjustmentAmount TEXT NOT NULL DEFAULT '0',
            AdjustmentReason TEXT NOT NULL DEFAULT '',
            Adjustment       TEXT NOT NULL DEFAULT '0',
            Subtotal         TEXT NOT NULL DEFAULT '0',
            Total            TEXT NOT NULL DEFAULT '0',
            SavedAt          TEXT NOT NULL DEFAULT ''
        );
    ";
    create.ExecuteNonQuery();
    Console.WriteLine("[Startup] All tables created / verified.");

    // Add Notes column if upgrading from an older database
    var cols = conn.CreateCommand();
    cols.CommandText = "PRAGMA table_info(Drivers)";
    bool hasNotes = false;
    using (var r = cols.ExecuteReader())
        while (r.Read())
            if (r.GetString(1).Equals("Notes", StringComparison.OrdinalIgnoreCase))
            { hasNotes = true; break; }
    if (!hasNotes)
    {
        var alter = conn.CreateCommand();
        alter.CommandText = "ALTER TABLE Drivers ADD COLUMN Notes TEXT";
        alter.ExecuteNonQuery();
        Console.WriteLine("[Startup] Added Notes column to Drivers.");
    }

    // Seed default users — passwords come from appsettings, not source code
    var hash1 = BCrypt.Net.BCrypt.HashPassword(adminPw);
    var hash2 = BCrypt.Net.BCrypt.HashPassword(accountPw);
    var seed  = conn.CreateCommand();
    seed.CommandText = @"
        INSERT OR IGNORE INTO Users (Id, Email, PasswordHash, Name, Role, CompanyId, CompanyName)
        VALUES
        (1, 'dispatch@pakslogistic.com',   @h1, 'Paks Admin',      'admin',      'company-paks', 'Paks Logistic LLC'),
        (2, 'accounting@pakslogistic.com', @h2, 'Paks Accounting', 'accounting', 'company-paks', 'Paks Logistic LLC');
    ";
    seed.Parameters.AddWithValue("@h1", hash1);
    seed.Parameters.AddWithValue("@h2", hash2);
    seed.ExecuteNonQuery();
    Console.WriteLine("[Startup] Default users seeded (existing accounts untouched).");
}
catch (Exception ex)
{
    Console.WriteLine($"[Startup] Database setup FAILED: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("ReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
