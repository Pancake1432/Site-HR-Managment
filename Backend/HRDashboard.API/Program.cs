using System.Text;
using HRDashboard.API.Data;
using HRDashboard.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── Swagger cu suport JWT ─────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRDashboard API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Introdu token-ul JWT: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── SQLite Database ───────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=hrdashboard.db"));

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── TokenService (injectat în controllere) ────────────────────────────────────
builder.Services.AddScoped<TokenService>();

// ── CORS — permite frontul React ──────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://localhost:5173"   // ← adaugă și versiunea https
        )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Auto-migrate + seed la pornire ───────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ReactApp");          // CORS trebuie înainte de Auth
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
