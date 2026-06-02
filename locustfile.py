import random
from datetime import date, timedelta

from locust import HttpUser, task, between


# ============================================================
# Utilidades compartidas
# ============================================================

class AuthenticatedUserMixin:
    username = None
    password = "testpass123"

    def on_start(self):
        self.token = None

        response = self.client.post(
            "/api/auth/login/",
            json={
                "username": self.username,
                "password": self.password,
            },
            name="[Auth] /api/auth/login/",
        )

        if response.status_code == 200:
            self.token = response.json().get("access")
        else:
            print(
                f"No fue posible autenticar el usuario '{self.username}'. "
                f"Status: {response.status_code}. "
                f"Body: {response.text[:300]}"
            )

    def auth_headers(self):
        if not self.token:
            return None

        return {
            "Authorization": f"Bearer {self.token}",
        }

    def future_range(self, start_min=30, start_max=300, nights=2):
        start_days = random.randint(start_min, start_max)
        check_in = date.today() + timedelta(days=start_days)
        check_out = check_in + timedelta(days=nights)

        return str(check_in), str(check_out)


# ============================================================
# Listings service
# ============================================================

class ListingsUser(HttpUser):
    """
    Simula navegación pública por publicaciones y catálogos.
    """

    wait_time = between(1, 3)
    weight = 2

    @task(5)
    def search_properties_with_filters(self):
        self.client.get(
            "/api/listings/search/",
            params={
                "keyword": "Apartamento",
                "min_price": 50000,
                "max_price": 300000,
                "bedrooms": 2,
                "bathrooms": 1,
                "maxguests": 2,
            },
            name="[Listings] /api/listings/search/ con filtros",
        )

    @task(3)
    def search_properties_without_filters(self):
        self.client.get(
            "/api/listings/search/",
            name="[Listings] /api/listings/search/ sin filtros",
        )

    @task(3)
    def list_properties(self):
        self.client.get(
            "/api/listings/",
            name="[Listings] /api/listings/",
        )

    @task(2)
    def get_listing_detail(self):
        listing_id = random.randint(1, 12)

        self.client.get(
            f"/api/listings/{listing_id}/",
            name="[Listings] /api/listings/<id>/",
        )

    @task(1)
    def location_terms(self):
        self.client.get(
            "/api/location-terms/",
            name="[Listings] /api/location-terms/",
        )

    @task(1)
    def list_regions(self):
        self.client.get(
            "/api/listings/region/",
            name="[Listings] /api/listings/region/",
        )

    @task(1)
    def list_departments_by_region(self):
        region_id = random.randint(1, 5)

        self.client.get(
            f"/api/listings/region/{region_id}/",
            name="[Listings] /api/listings/region/<region_id>/",
        )

    @task(1)
    def list_municipalities_by_department(self):
        department_id = random.randint(1, 10)

        self.client.get(
            f"/api/listings/department/{department_id}/",
            name="[Listings] /api/listings/department/<department_id>/",
        )


# ============================================================
# Booking service - Guest
# ============================================================

class BookingGuestUser(AuthenticatedUserMixin, HttpUser):
    """
    Simula acciones de lectura/cálculo de un huésped.
    """

    username = "laura"
    password = "lauracolombianstay"

    wait_time = between(1, 3)
    weight = 2

    @task(5)
    def obtain_preinformation(self):
        check_in, check_out = self.future_range(
            start_min=30,
            start_max=300,
            nights=2,
        )

        self.client.post(
            "/api/bookings/preinformation/",
            json={
                "property_id": random.randint(1, 12),
                "check_in": check_in,
                "check_out": check_out,
                "guests": random.randint(1, 2),
            },
            name="[Booking Guest] /api/bookings/preinformation/",
        )

    @task(3)
    def list_user_reservations(self):
        headers = self.auth_headers()

        if not headers:
            return

        self.client.get(
            "/api/user-reservations/",
            headers=headers,
            name="[Booking Guest] /api/user-reservations/",
        )

    # No recomendado para el escenario principal porque modifica la base.
    # Úsalo solo en una base desechable o en un locustfile separado.
    #
    # @task(1)
    # def create_booking(self):
    #     headers = self.auth_headers()
    #
    #     if not headers:
    #         return
    #
    #     check_in, check_out = self.future_range(
    #         start_min=400,
    #         start_max=800,
    #         nights=2,
    #     )
    #
    #     self.client.post(
    #         "/api/bookings/",
    #         json={
    #             "property_id": random.randint(1, 12),
    #             "check_in_date": check_in,
    #             "check_out_date": check_out,
    #             "number_of_guests": 1,
    #         },
    #         headers=headers,
    #         name="[Booking Guest] /api/bookings/",
    #     )


# ============================================================
# Booking service - Host
# ============================================================

class BookingHostUser(AuthenticatedUserMixin, HttpUser):
    """
    Simula acciones de lectura de un anfitrión.
    """

    username = "julian"
    password = "juliancolombianstay"

    wait_time = between(1, 3)
    weight = 1

    @task(5)
    def list_host_reservations(self):
        headers = self.auth_headers()

        if not headers:
            return

        self.client.get(
            "/api/host-reservations/",
            headers=headers,
            name="[Booking Host] /api/host-reservations/",
        )