from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.contrib.auth.base_user import BaseUserManager
from dateutil.relativedelta import relativedelta

# ----------------------------
# Custom User Manager
# ----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # automatically hashes
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# ----------------------------
# Custom User Model
# ----------------------------

class Memberships (models.TextChoices):
    MONTHLY = "Monthly", "Monthly"
    THREE_MONTH = "3 Months", "3 Months"
    SIX_MONTH = "6 Months", "6 Months"
    TEN_CREDITS = "10 Credits", "10 Credits"
    TWENTY_CREDITS = "20 Credits", "20 Credits"


class MembershipsBought(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey('userModel', on_delete=models.CASCADE, related_name='membership_bought', default=None)
    membership = models.CharField(
        max_length=20,
        choices=Memberships.choices,
        default=None,
    )
    purchase_date = models.DateField(auto_now_add=True)
    start_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.id}: {self.membership} for User {self.userId.email}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate expiration date based on membership type."""
        if self.start_date:
            if self.membership == Memberships.MONTHLY:
                self.expiration_date = self.start_date + relativedelta(months=1)
            elif self.membership == Memberships.THREE_MONTH:
                self.expiration_date = self.start_date + relativedelta(months=3)
            elif self.membership == Memberships.SIX_MONTH:
                self.expiration_date = self.start_date + relativedelta(months=6)
            elif self.membership == Memberships.TEN_CREDITS:
                self.expiration_date = self.start_date + relativedelta(months=1)
            elif self.membership == Memberships.TWENTY_CREDITS:
                self.expiration_date = self.start_date + relativedelta(months=2)
        super().save(*args, **kwargs)

class userModel(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    start_date = models.DateField(null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Avoid clashes with auth.User groups/permissions
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.id}"

# ----------------------------
# Classes Model
# ----------------------------
class Classes(models.Model):
    classId = models.AutoField(primary_key=True)
    class_name = models.CharField(max_length=100)
    class_description = models.TextField()
    class_date = models.DateField()
    start_time = models.TimeField(default="12:00:00")
    end_time = models.TimeField(null=True, blank=True)  # allow null
    is_passed = models.BooleanField(default=False)
    instructor_name = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if self.end_time is None and self.start_time:
            from datetime import datetime, timedelta
            # Convert TimeField to datetime, add 1 hour, and extract time
            dt = datetime.combine(self.class_date, self.start_time) + timedelta(hours=1)
            self.end_time = dt.time()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.classId}"

# ----------------------------
# Booked Classes Model
# ----------------------------
class BookedClasses(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(userModel, on_delete=models.CASCADE, related_name='booked_users', default=None)
    classId = models.ForeignKey(Classes, on_delete=models.CASCADE, related_name='bookings', default=None)
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.userId.id}: {self.userId.first_name} {self.userId.last_name} - {self.classId.classId}: {self.classId.class_name} {self.classId.class_date} {self.classId.start_time}"

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True)
    host = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        from datetime import datetime, timedelta
        if not self.end_time and self.start_time:
            dt = datetime.combine(self.date, self.start_time) + timedelta(hours=1)
            self.end_time = dt.time()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} on {self.date}"

    class Meta:
        ordering = ['event_id']
